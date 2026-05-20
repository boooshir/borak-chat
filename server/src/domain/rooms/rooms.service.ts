import { Prisma } from "../../../generated/prisma";
import { ResultType } from "../core/shared/response.util";
import {
  ListRoomsResponse,
  MembersListResponse,
  RoomMessagesResponse,
} from "./rooms.model";
import { RoomsRepository } from "./rooms.repositry";
import { UserService } from "../user/user.service";
import { broadcastToRoom } from "../../infrastructure/ws/websocketManager";

export const RoomsService = (
  repo: RoomsRepository,
  userService: ReturnType<typeof UserService>,
) => ({
  create: async (
    creatorId: number,
    name: string,
    isPrivate: boolean,
  ): Promise<ResultType<any, any>> => {
    try {
      const room = await repo.createRoom(creatorId, name, isPrivate);
      return {
        ok: true,
        message: "Room is successfull created",
        data: {
          publicId: room.publicId,
          name: room.name,
          lastMessage: null,
          lastMessageCreated: null,
          totalMember: "1",
          isPrivate: room.isPrivate,
        },
        statusCode: 201,
      };
    } catch (error: any) {
      if (error instanceof Prisma.PrismaClientUnknownRequestError) {
        return {
          ok: false,
          message: error.message,
          statusCode: 500,
        };
      }
      return {
        ok: false,
        message: error.message,
        statusCode: 500,
      };
    }
  },
  getList: async (
    userId: number,
  ): Promise<ResultType<ListRoomsResponse[], any>> => {
    try {
      const rooms = await repo.getRooms(userId);
      const result = rooms.map((item) => ({
        publicId: item.publicId,
        name: item.name,
        lastMessage: item.lastMessage,
        lastMessageCreated: item.lastMessageCreated,
        totalMember: item.totalMember.toString(),
        isPrivate: item.isPrivate,
      }));
      return {
        ok: true,
        message: "success",
        data: result,
        statusCode: 200,
      };
    } catch (error: any) {
      return {
        ok: false,
        message: error.message,
        statusCode: 500,
      };
    }
  },
  getDetails: async (
    userId: number,
    publicRoomId: string,
  ): Promise<ResultType<MembersListResponse[], null>> => {
    try {
      const room = await repo.getDetails(publicRoomId);
      if (!room) {
        return {
          ok: false,
          message: "room not found",
          statusCode: 400,
        };
      }
      const isMember = await repo.isMember(userId, room.id);
      if (!isMember) {
        return {
          ok: false,
          message: "Ops you are not member",
          statusCode: 400,
        };
      }
      const members = await repo.getMembers(room.id);
      return {
        ok: true,
        message: "successfull",
        data: members,
        statusCode: 200,
      };
    } catch (error: any) {
      return {
        ok: false,
        message: error.message,
        statusCode: 500,
      };
    }
  },

  getMessages: async (
    userId: number,
    publicRoomId: string,
    currentPage: number,
  ): Promise<
    ResultType<
      {
        roomName: string;
        totalPages: number;
        currentPage: number;
        hasMore: boolean;
        messages: RoomMessagesResponse[];
      },
      any
    >
  > => {
    const PAGE_LIMIT = 20;
    const OFFSET = (currentPage - 1) * PAGE_LIMIT;

    try {
      const room = await repo.findRoom(publicRoomId);
      if (!room) {
        return {
          ok: false,
          message: "room not found",
          statusCode: 404,
        };
      }
      const isMember = await repo.isMember(userId, room.id);
      if (!isMember) {
        return {
          ok: false,
          message: "You are not member",
          statusCode: 400,
        };
      }
      const messages = await repo.getRoomMessages(
        room.id,
        userId,
        PAGE_LIMIT,
        OFFSET,
      );

      const totalMessages = await repo.countMessages(room.id);
      const totalPages = Math.ceil(totalMessages / PAGE_LIMIT);

      (async () => {
        if (messages.length > 0) {
          try {
            await repo.updateRoomMessageRead(userId, room.id, messages[0].id);
          } catch (error) {
            throw new Error("failed to update read status");
          }
        }
      })();

      return {
        ok: true,
        message: "success",
        data: {
          roomName: room.name,
          totalPages,
          currentPage: currentPage,
          hasMore: currentPage >= totalPages ? false : true,
          messages,
        },
        statusCode: 200,
      };
    } catch (error: any) {
      return { ok: false, message: error.messages, statusCode: 500 };
    }
  },
  sendMessage: async (
    userId: number,
    userPublicId: string,
    publicRoomId: string,
    content: string,
  ): Promise<ResultType<any, any>> => {
    const room = await repo.findRoom(publicRoomId);
    if (!room) {
      return {
        ok: false,
        message: "room not found",
        statusCode: 404,
      };
    }
    const isMember = await repo.isMember(userId, room.id);
    if (!isMember) {
      return {
        ok: false,
        message: "You are not member",
        statusCode: 400,
      };
    }
    try {
      const message = await repo.sendMessage(userId, room.id, content);
      const payload = {
        id: message?.id,
        sender: isMember.username,
        content: message?.content,
        created_at: message?.created_at,
        is_read: false,
        is_own: false,
      };
      broadcastToRoom(publicRoomId, {
        type: "NEW_ROOM_MESSAGE",
        userPublicId: userPublicId,
        roomPublicId: publicRoomId,
        payload: payload,
      });

      return {
        ok: true,
        message: "success send message",
        statusCode: 201,
      };
    } catch (error: any) {
      return {
        ok: false,
        message: error.message,
        statusCode: 500,
      };
    }
  },
  invitation: async (
    userId: number,
    publicFriendId: string,
    publicRoomId: string,
  ): Promise<ResultType<null, null>> => {
    const friend = await userService.findByPublicId(publicFriendId);
    if (!friend) {
      return {
        ok: false,
        message: "Friend not found",
        statusCode: 400,
      };
    }
    const room = await repo.findRoom(publicRoomId);
    if (!room) {
      return {
        ok: false,
        message: "room not found",
        statusCode: 404,
      };
    }
    // chekc if friend is room member
    const isFriendIsMember = await repo.isMember(friend.id, room.id);

    if (isFriendIsMember) {
      return {
        ok: false,
        message: "this user is member",
        statusCode: 401,
      };
    }
    // check admin is member and isadmin
    const isMember = await repo.isMember(userId, room.id);
    if (!isMember) {
      return {
        ok: false,
        message: "You are not member",
        statusCode: 400,
      };
    }
    if (!isMember.isAdmin) {
      return {
        ok: false,
        message: "You not allowed to create invitaion",
        statusCode: 401,
      };
    }
    try {
      await repo.createInvitation(friend.id, room.id);
      return {
        ok: false,
        message: "Invitaion created",
        statusCode: 201,
      };
    } catch (error: any) {
      return {
        ok: false,
        message: error.message,
        statusCode: 500,
      };
    }
  },
  //updateReadMessage: async (
  //  userId: number,
  //  publicRoomId: string,
  //  lastMessagesId: number,
  //) => {
  //  try {
  //    const room = await repo.findRoom(publicRoomId);
  //    if (!room) {
  //      return {
  //        ok: false,
  //        message: "room not found",
  //        statusCode: 404,
  //      };
  //    }
  //    const isMember = await repo.isMember(userId, room.id);
  //    if (!isMember) {
  //      return {
  //        ok: false,
  //        message: "You are not member",
  //        statusCode: 400,
  //      };
  //    }
  //    await repo.updateRoomMessageRead(userId, room.id, lastMessagesId);
  //    return {
  //      ok: true,
  //      message: "success update the user",
  //    };
  //  } catch (error: any) {
  //    return {
  //      ok: false,
  //      message: error.message,
  //      statusCode: 500,
  //    };
  //  }
  //},
});

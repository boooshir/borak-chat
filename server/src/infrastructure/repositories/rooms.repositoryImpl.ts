import {
  ListRoomsResponse,
  RoomMessagesResponse,
} from "../../domain/rooms/rooms.model";
import { RoomsRepository } from "../../domain/rooms/rooms.repositry";
import { prisma } from "../db/db";

export const RoomsRepositoryImpl: RoomsRepository = {
  createRoom: async (creatorId, name, isPrivate) => {
    return await prisma.room.create({
      data: {
        creatorId,
        name,
        isPrivate,
        members: {
          create: {
            userId: creatorId,
            isAdmin: true,
          },
        },
        UserRoomStatus: {
          create: {
            userId: creatorId,
          },
        },
      },
      select: {
        publicId: true,
        creatorId: true,
        name: true,
        isPrivate: true,
      },
    });
  },
  getRooms: async (userId) => {
    return await prisma.$queryRaw<ListRoomsResponse[]>`
        WITH LatestGroupMessage AS (
          SELECT
            rm.room_id,
            rm.content,
            rm.created_at,
          ROW_NUMBER() OVER (PARTITION BY rm.room_id ORDER BY rm.created_at DESC) as rn
          FROM room_messages as rm
        ),
        RoomMemberCount AS (
          SELECT
            rm.room_id,
            COUNT(DISTINCT rm.user_id) as totalMemberCount
          FROM room_members as rm 
          GROUP BY rm.room_id
        )
        SELECT DISTINCT 
          r.public_id AS publicId, 
          r.name AS name, 
          lgm.content AS lastMessage, 
          lgm.created_at AS lastMessageCreated,
          rmc.totalMemberCount as totalMember,
          r.is_private as isPrivate
        FROM room_members as rm
        JOIN rooms AS r ON rm.room_id = r.id
        LEFT JOIN LatestGroupMessage as lgm ON r.id = lgm.room_id AND lgm.rn = 1
        LEFT JOIN RoomMemberCount as rmc ON r.id = rmc.room_id
        WHERE user_id = ${userId}
        ORDER BY lgm.created_at DESC NULLS LAST
        ;
    `;
  },
  isMember: async (userId, roomId) => {
    const roomMember = await prisma.roomMember.findFirst({
      where: {
        userId,
        roomId,
      },
      select: {
        id: true,
        isAdmin: true,
        user: {
          select: {
            username: true,
          },
        },
      },
    });
    return {
      id: roomMember?.id,
      isAdmin: roomMember?.isAdmin,
      username: roomMember?.user.username,
    };
  },
  getDetails: async (publicRoomId) => {
    return await prisma.room.findFirst({
      where: {
        publicId: publicRoomId,
      },
      select: {
        id: true,
        publicId: true,
        name: true,
      },
    });
  },
  getMembers: async (roomId) => {
    return await prisma.$queryRaw`
      SELECT u.public_id as publicId, u.username as username, rm.is_admin as isAdmin
      FROM room_members as rm
      JOIN users as u ON u.id = rm.user_id
      WHERE rm.room_id = ${roomId};
    `;
  },
  findRoom: async (publicRoomId) => {
    return await prisma.room.findFirst({
      where: {
        publicId: publicRoomId,
      },
      select: {
        id: true,
        publicId: true,
        name: true,
      },
    });
  },
  getRoomMessages: async (roomId, userId, pageLimit, offSet) => {
    const roomMessages = await prisma.$queryRaw<RoomMessagesResponse[]>`
      SELECT 
        rm.id, 
        u.username as sender, 
        rm.content,
        rm.created_at as createdAt,
        CASE 
        WHEN rm.sender_id = ${userId} THEN TRUE ELSE FALSE
        END as isOwn
      FROM room_messages as rm
      JOIN users as u ON rm.sender_id = u.id
      WHERE rm.room_id = ${roomId}
      ORDER BY rm.created_at DESC
      LIMIT ${pageLimit} OFFSET ${offSet}
    `;
    const messages = roomMessages.map((item) => ({
      id: item.id,
      sender: item.sender,
      content: item.content,
      createdAt: item.createdAt,
      isOwn: Boolean(item.isOwn),
    }));
    return messages;
  },
  countMessages: async (roomId) => {
    return await prisma.roomMessage.count({
      where: {
        roomId,
      },
    });
  },
  sendMessage: async (userId, roomId, content) => {
    const message = await prisma.roomMessage.create({
      data: {
        senderId: userId,
        roomId,
        content,
      },
    });

    return {
      id: message.id,
      content: message.content,
      created_at: message.createdAt,
    };
  },
  createInvitation: async (userId: number, roomId: number) => {
    await prisma.room.update({
      where: {
        id: roomId,
      },
      data: {
        members: {
          create: {
            userId: userId,
          },
        },
        UserRoomStatus: {
          create: {
            userId: userId,
          },
        },
      },
    });
    return;
  },
  updateRoomMessageRead: async (userId, roomId, lastMessageId) => {
    return await prisma.userRoomStatus.upsert({
      where: {
        userId_roomId: {
          userId,
          roomId,
        },
      },
      update: {
        lastReadMessageId: lastMessageId,
      },
      create: {
        userId,
        roomId,
        lastReadMessageId: lastMessageId,
      },
    });
  },
};

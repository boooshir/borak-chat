import { FriendshipRespository } from "../../domain/friendship/friendship.repository";
import { prisma } from "../db/db";

export const FriendshipRepositoryImpl: FriendshipRespository = {
  create: async (requesterId, requesteeId) => {
    try {
      await prisma.friendship.create({
        data: {
          requesterId: requesterId,
          requesteeId: requesteeId,
          token: Bun.randomUUIDv7(),
          status: "pending",
        },
      });
      return new Response("success");
    } catch (error) {
      if (error instanceof Error) {
        return new Error(error.message);
      }
    }
  },
  findIncomingList: async (userId) => {
    const incomingList = await prisma.friendship.findMany({
      where: { requesteeId: userId, status: "pending" },
      select: {
        status: true,
        createdAt: true,
        token: true,
        requester: {
          select: {
            publicId: true,
            username: true,
          },
        },
      },
    });
    return incomingList;
  },
  findOutgoingList: async (userId) => {
    const incomingList = await prisma.friendship.findMany({
      where: { requesterId: userId, status: "pending" },
      select: {
        status: true,
        createdAt: true,
        requestee: {
          select: {
            publicId: true,
            username: true,
          },
        },
      },
    });
    return incomingList;
  },
  findToken: async (token) => {
    return await prisma.friendship.findFirst({
      where: {
        token: token,
      },
      select: {
        id: true,
      },
    });
  },
  updateStatus: async (token, status) => {
    return await prisma.friendship.update({
      where: {
        token: token,
      },
      data: {
        status: status,
      },
    });
  },
  friendList: async (userId: number, status: string) => {
    return await prisma.$queryRaw`
      SELECT DISTINCT u2.public_id as publicId, u2.username as username, f.created_at as createdAt 
      FROM users as u1
      JOIN friendships as f ON u1.id = f.requestee_id OR u1.id = f.requester_id
      JOIN users as u2 ON f.requestee_id = u2.id OR f.requester_id = u2.id
      WHERE u1.id = ${userId} AND NOT u2.id = ${userId} AND status = ${status};
    `;
  },
  findFriend: async (friendId: number) => {
    return await prisma.friendship.findFirst({
      where: {
        OR: [{ requesteeId: friendId }, { requesterId: friendId }],
      },
    });
  },
};

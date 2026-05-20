import { GetDirectMessageResponse } from "../../domain/messages/messages.model";
import { MessagesRespository } from "../../domain/messages/messages.repository";
import { prisma } from "../db/db";

export const MessagesRepositoryImpl: MessagesRespository = {
  getMessages: async (currentUserId, friendId, pageLimit, offset) => {
    const messages = await prisma.$queryRaw<GetDirectMessageResponse[]>`
      SELECT
        dm.id,
        dm.content,
        dm.created_at as createdAt,
        dm.is_read as isRead,
        sender.username as sender,
        CASE
          WHEN dm.sender_id = ${currentUserId} THEN TRUE
          ELSE FALSE
        END AS isOwn
      FROM
        direct_messages dm
      JOIN users as sender ON sender.id = dm.sender_id
      WHERE
        (dm.sender_id = ${currentUserId} AND dm.receiver_id = ${friendId})
        OR
        (dm.sender_id = ${friendId} AND dm.receiver_id = ${currentUserId})
      ORDER BY
        dm.created_at DESC
      LIMIT ${pageLimit} OFFSET ${offset};
    `;
    return messages;
  },
  countMessages: async (currentUserId, friendId) => {
    return await prisma.directMessage.count({
      where: {
        OR: [
          { senderId: currentUserId, receiverId: friendId },
          { senderId: friendId, receiverId: currentUserId },
        ],
      },
    });
  },
  sendMessage: async (senderId, receiverId, content) => {
    const message = await prisma.directMessage.create({
      data: {
        senderId: senderId,
        receiverId: receiverId,
        content: content,
        isRead: false,
      },
    });
    return message;
  },
  updateRead: async (senderId, receiverId) => {
    return await prisma.directMessage.updateMany({
      where: { senderId: receiverId, receiverId: senderId, isRead: false },
      data: {
        isRead: true,
      },
    });
  },
};

import { z } from "zod";

export const createRoomsSchema = z.object({
  name: z.string().min(1),
  isPrivate: z.boolean().default(false),
});

export const sendMessageToRoomSchema = z.object({
  content: z.string().min(1),
});

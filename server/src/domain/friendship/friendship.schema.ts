import { z } from "zod";

export const checkFrienshipSchema = z.object({
  friendPublicId: z.string().min(10),
});

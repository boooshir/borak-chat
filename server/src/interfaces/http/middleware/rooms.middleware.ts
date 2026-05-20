import { createMiddleware } from "hono/factory";
import {
  createRoomsSchema,
  sendMessageToRoomSchema,
} from "../../../domain/rooms/rooms.schema";
import { createErrorResponse } from "../../../shared/utils/response.util";

export const createRoomsValidation = createMiddleware(async (c, next) => {
  const data = await c.req.json();
  const result = createRoomsSchema.safeParse(data);
  if (!result.success) {
    return c.json(
      createErrorResponse("Field error", result.error.flatten().fieldErrors),
      400,
    );
  }
  c.set("createRoomsValidated", result.data);
  await next();
});

export const sendMessageToRoomValidation = createMiddleware(async (c, next) => {
  const data = await c.req.json();
  const result = sendMessageToRoomSchema.safeParse(data);
  if (!result.success) {
    return c.json(
      createErrorResponse("Field Error", result.error.flatten().fieldErrors),
      400,
    );
  }
  c.set("sendMessageValidated", result.data);
  await next();
});

export const sendInvitaionRoomValidation = createMiddleware(async (c, next) => {
  const data = await c.req.json();
  if (data.friendId === undefined || data.friendId === "") {
    return c.json(
      createErrorResponse("Field Error", {
        errors: { friendId: ["Id is required"] },
      }),
    );
  }
  c.set("friendId", data.friendId);
  await next();
});

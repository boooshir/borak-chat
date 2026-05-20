import { Hono } from "hono";
import { authMiddleware } from "../middleware/auth.middlware";
import {
  createRoomsValidation,
  sendInvitaionRoomValidation,
  sendMessageToRoomValidation,
} from "../middleware/rooms.middleware";
import { RoomsService } from "../../../domain/rooms/rooms.service";
import { RoomsRepositoryImpl } from "../../../infrastructure/repositories/rooms.repositoryImpl";
import {
  createErrorResponse,
  createSuccessResponse,
} from "../../../shared/utils/response.util";
import { UserService } from "../../../domain/user/user.service";
import { UserRepositoryImpl } from "../../../infrastructure/repositories/user.repositoryimpl";

type Variables = {
  user: { sub: number; publicId: string };
  createRoomsValidated: { name: string; isPrivate: boolean };
  sendMessageValidated: { content: string };
  friendId: string;
};

function isNumber(value: string) {
  return !isNaN(parseFloat(value));
}

const roomsService = RoomsService(
  RoomsRepositoryImpl,
  UserService(UserRepositoryImpl),
);

const roomsRoutes = new Hono<{ Variables: Variables }>();

roomsRoutes.use(authMiddleware);

roomsRoutes.post("/rooms", createRoomsValidation, async (c) => {
  // get currentUser for creator id
  const currentUser = c.get("user");
  // validate input
  const validated = c.get("createRoomsValidated");
  // create room
  const result = await roomsService.create(
    currentUser.sub,
    validated.name,
    validated.isPrivate,
  );
  if (!result.ok) {
    return c.json(createErrorResponse(result.message), result.statusCode);
  }
  return c.json(
    createSuccessResponse(result.message, result.data),
    result.statusCode,
  );
});

roomsRoutes.get("/rooms", async (c) => {
  // get curent user
  const currentUser = c.get("user");
  // return rooms
  const result = await roomsService.getList(currentUser.sub);
  if (!result.ok) {
    return c.json(createErrorResponse(result.message), result.statusCode);
  }
  return c.json(
    createSuccessResponse(result.message, result.data),
    result.statusCode,
  );
});

roomsRoutes.get("/rooms/:roomId", async (c) => {
  // get current user
  // get rooms by current id
  const currentUser = c.get("user");
  const roomId = c.req.param("roomId");

  const result = await roomsService.getDetails(currentUser.sub, roomId);

  if (!result.ok) {
    return c.json(createErrorResponse(result.message), result.statusCode);
  }
  return c.json(
    createSuccessResponse(result.message, result.data),
    result.statusCode,
  );
  // check room member
  // return room details
});

roomsRoutes.get("/rooms/:roomId/messages", async (c) => {
  // get current user
  const currentUser = c.get("user");
  // get roomId from param
  const publicRoomId = c.req.param("roomId");
  const currentPage = c.req.query("page") || "1";

  if (!isNumber(currentPage)) {
    return c.json(
      createErrorResponse("Number only, current page type is not allowed."),
      400,
    );
  }
  const result = await roomsService.getMessages(
    currentUser.sub,
    publicRoomId,
    parseFloat(currentPage),
  );
  if (!result.ok) {
    return c.json(createErrorResponse(result.message), result.statusCode);
  }
  // return
  return c.json(
    createSuccessResponse(result.message, result.data),
    result.statusCode,
  );
});

roomsRoutes.post(
  "/rooms/:roomId/messages",
  sendMessageToRoomValidation,
  async (c) => {
    const currentUser = c.get("user");
    const publicRoomId = c.req.param("roomId");
    const validated = c.get("sendMessageValidated");

    // check room is available
    // check is user is member
    // create new message
    const result = await roomsService.sendMessage(
      currentUser.sub,
      currentUser.publicId,
      publicRoomId,
      validated.content,
    );
    // return result
    if (!result.ok) {
      return c.json(createErrorResponse(result.message), result.statusCode);
    }
    return c.json(createSuccessResponse(result.message), result.statusCode);
  },
);

roomsRoutes.post(
  "/rooms/:roomId/invitation",
  sendInvitaionRoomValidation,
  async (c) => {
    // const get current user
    const currentUser = c.get("user");
    const publicRoomId = c.req.param("roomId");
    const friendId = c.get("friendId");

    if (!publicRoomId) {
      return c.json(createErrorResponse("invalid room id"), 400);
    }
    // handle create invitaion
    // verification if currentUser is rooms admin
    const result = await roomsService.invitation(
      currentUser.sub,
      friendId,
      publicRoomId,
    );

    // return error
    if (!result.ok) {
      return c.json(createErrorResponse(result.message), result.statusCode);
    }
    // return success
    return c.json(createSuccessResponse(result.message), result.statusCode);
  },
);

export { roomsRoutes };

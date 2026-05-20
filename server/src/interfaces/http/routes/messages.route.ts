import { Hono } from "hono";
import { authMiddleware } from "../middleware/auth.middlware";
import { MessagesService } from "../../../domain/messages/messages.service";
import { MessagesRepositoryImpl } from "../../../infrastructure/repositories/messages.repositoryImpl";
import {
  createErrorResponse,
  createSuccessResponse,
} from "../../../shared/utils/response.util";
import {
  friendValidation,
  sendMessagesValidation,
} from "../middleware/messages.middleware";
import { UserService } from "../../../domain/user/user.service";
import { UserRepositoryImpl } from "../../../infrastructure/repositories/user.repositoryimpl";

type Variables = {
  user: { sub: number; publicId: string };
  createMessagesValidated: { content: string };
  friendId: number;
};

const messagesService = MessagesService(
  MessagesRepositoryImpl,
  UserService(UserRepositoryImpl),
);

const messagesRoutes = new Hono<{ Variables: Variables }>();

messagesRoutes.use(authMiddleware);

function isNumber(value: string) {
  return !isNaN(parseFloat(value));
}

messagesRoutes.get(
  "/messages/direct/:friendId",
  friendValidation,
  async (c) => {
    // get current auth user
    const currentUser = c.get("user");

    // search with query params
    const friendId = c.req.param("friendId");

    // # HANDLE PAGINATION
    //* get page
    const currentPage = c.req.query("page") || "1";
    if (!isNumber(currentPage)) {
      return c.json(
        createErrorResponse("Number only, current page type is not allowed."),
        400,
      );
    }
    // return message
    const messages = await messagesService.getAll(
      currentUser.sub,
      friendId,
      parseFloat(currentPage),
    );
    if (messages.ok === false) {
      return c.json(createErrorResponse(messages.message), messages.statusCode);
    }
    return c.json(
      createSuccessResponse("success retrive messages", messages.data),
      messages.statusCode,
    );
  },
);

messagesRoutes.post(
  "/messages/direct/:friendId",
  friendValidation,
  sendMessagesValidation,
  async (c) => {
    // get current auth user
    const currentUser = c.get("user");
    // search with query params
    const friendId = c.get("friendId");
    // check if friend status is accepted
    // get validated content
    const validated = c.get("createMessagesValidated");
    // create new message
    const result = await messagesService.send(
      currentUser.sub,
      currentUser.publicId,
      friendId,
      validated.content,
    );
    if (result.ok === false) {
      return c.json(createErrorResponse(result.message), result.statusCode);
    }
    return c.json(
      createSuccessResponse("Success create message", result.data),
      result.statusCode,
    );
  },
);
messagesRoutes.put(
  "/messages/direct/:friendId/read",
  friendValidation,
  async (c) => {
    // get both requester_id and requestee_id
    const currentUser = c.get("user");
    const publicId = c.req.param("friendId");
    // this is publicId
    // find messages if isRead is false
    // please make sure validation inside services
    // update message status
    const updateRead = await messagesService.updateRead(
      publicId,
      currentUser.sub,
    );
    // return error
    if (updateRead?.ok === false) {
      return c.json(
        createErrorResponse(updateRead?.message),
        updateRead.statusCode,
      );
    }
    // return sucess
    return c.json(createSuccessResponse("you read all message"));
  },
);
export { messagesRoutes };

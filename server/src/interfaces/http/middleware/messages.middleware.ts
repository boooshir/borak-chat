import { createMiddleware } from "hono/factory";
import { createErrorResponse } from "../../../shared/utils/response.util";
import { UserService } from "../../../domain/user/user.service";
import { UserRepositoryImpl } from "../../../infrastructure/repositories/user.repositoryimpl";
import { FriendshipRepositoryImpl } from "../../../infrastructure/repositories/friendsip.repositoryimpl";
import { FriendshipService } from "../../../domain/friendship/friendship.service";
import { CreateMessageSchema } from "../../../domain/messages/messages.schema";

const userService = UserService(UserRepositoryImpl);
const friendService = FriendshipService(FriendshipRepositoryImpl);

export const sendMessagesValidation = createMiddleware(async (c, next) => {
  const data = await c.req.json();
  const publicId = c.req.param("friendId");
  const result = CreateMessageSchema.safeParse(data);

  if (!result.success) {
    return c.json(
      createErrorResponse("field error", result.error.flatten().fieldErrors),
    );
  }

  if (!publicId) {
    return c.json(createErrorResponse("public id is needed"), 400);
  }
  // get public friend id
  const friend = await userService.findByPublicId(publicId);
  if (!friend) {
    return c.json(createErrorResponse("User not found"), 401);
  }
  const isFriend = await friendService.find(friend.id);
  if (!isFriend || isFriend.status !== "accepted") {
    return c.json(createErrorResponse("you not friend ye"), 400);
  }
  c.set("friendId", friend.id);
  c.set("createMessagesValidated", result.data);
  await next();
});

// validate if friendId === current public user id
export const friendValidation = createMiddleware(async (c, next) => {
  // get current auth user
  const currentUser = c.get("user");
  // search with query params
  const publicFriendId = c.req.param("friendId");
  if (publicFriendId === currentUser.publicId) {
    return c.json(createErrorResponse("Cannot do action to yourself"));
  }
  await next();
});

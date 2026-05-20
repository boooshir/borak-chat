import { UserService } from "../../../domain/user/user.service";
import { UserRepositoryImpl } from "../../../infrastructure/repositories/user.repositoryimpl";
import { createMiddleware } from "hono/factory";
import { createErrorResponse } from "../../../shared/utils/response.util";
import { FriendshipService } from "../../../domain/friendship/friendship.service";
import { FriendshipRepositoryImpl } from "../../../infrastructure/repositories/friendsip.repositoryimpl";
import { checkFrienshipSchema } from "../../../domain/friendship/friendship.schema";

const userService = UserService(UserRepositoryImpl);
const friendshipService = FriendshipService(FriendshipRepositoryImpl);

export const requestFriendValidation = createMiddleware(async (c, next) => {
  const currentUser = c.get("user");
  const data = await c.req.json();
  const result = await checkFrienshipSchema.safeParseAsync(data);
  if (!result.success) {
    return c.json(
      createErrorResponse("invalid field", result.error.flatten().fieldErrors),
      400,
    );
  }
  if (currentUser.publicId === result.data.friendPublicId) {
    return c.json(
      createErrorResponse("cannot sent friend request to yourself"),
      400,
    );
  }

  // find requstee
  const requestee = await userService.findByPublicId(
    result.data.friendPublicId,
  );
  if (!requestee) {
    return c.json(
      createErrorResponse("not found", {
        friendPublicId: ["Friend not found"],
      }),
      404,
    );
  }
  // check if friendship is available and reject next request
  const friendExist = await friendshipService.find(requestee.id);
  if (friendExist) {
    return c.json(
      createErrorResponse(
        `${requestee.username} is already on you friend list`,
      ),
      400,
    );
  }
  c.set("requesteeId", requestee.id);
  await next();
});

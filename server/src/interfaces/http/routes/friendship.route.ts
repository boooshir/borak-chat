import { Hono } from "hono";
import { authMiddleware } from "../middleware/auth.middlware";
import { requestFriendValidation } from "../middleware/frindship.midleware";
import { FriendshipService } from "../../../domain/friendship/friendship.service";
import { FriendshipRepositoryImpl } from "../../../infrastructure/repositories/friendsip.repositoryimpl";
import {
  createErrorResponse,
  createSuccessResponse,
} from "../../../shared/utils/response.util";

type Variables = {
  requesteeId: number;
  user: { sub: number; publicId: string };
};

const friendshipRoutes = new Hono<{ Variables: Variables }>();

const friendshipService = FriendshipService(FriendshipRepositoryImpl);

friendshipRoutes.post(
  "/friend-request",
  authMiddleware,
  requestFriendValidation,
  async (c) => {
    const currentUser = c.get("user");
    const requesteeId = c.get("requesteeId");
    try {
      await friendshipService.create(currentUser.sub, requesteeId);
      return c.json(createSuccessResponse("Request friend sended"));
    } catch (error) {
      if (error instanceof Error) {
        return c.json(createErrorResponse(error.message), 400);
      }
    }
  },
);

friendshipRoutes.get("/friend-request/incoming", authMiddleware, async (c) => {
  const currentUser = c.get("user");
  // find all incoming list friend-request
  // checking Variables : current user id, pending status
  try {
    const incomingList = await friendshipService.incomingList(currentUser.sub);
    return c.json(
      createSuccessResponse("succeess retrive incoming list", incomingList),
    );
  } catch (error) {
    if (error instanceof Error) {
      return c.json(createErrorResponse("somthing wrong", error.message));
    }
  }
});

friendshipRoutes.get("/friend-request/outgoing", authMiddleware, async (c) => {
  const currentUser = c.get("user");
  // find all outgoing list friend-request
  // checking Variables : current user id, pending status
  try {
    const incomingList = await friendshipService.outgoingList(currentUser.sub);
    return c.json(
      createSuccessResponse("succeess retrive outgoing list", incomingList),
    );
  } catch (error) {
    if (error instanceof Error) {
      return c.json(createErrorResponse("somthing wrong", error.message));
    }
  }
});

friendshipRoutes.put(
  "/friend-request/:requestToken/accept",
  authMiddleware,
  async (c) => {
    // get request token from URL params
    const token = c.req.param("requestToken");

    // chech and update
    // return the response
    try {
      const tokenExist = await friendshipService.findToken(token);
      if (!tokenExist) {
        throw new Error("Token not found");
      }
      friendshipService.updateStatus(token, "accepted");
      return c.json(createSuccessResponse("Request friend accepted"));
    } catch (error) {
      if (error instanceof Error) {
        return c.json(createErrorResponse(error.message), 400);
      }
    }
  },
);

friendshipRoutes.put(
  "/friend-request/:requestToken/reject",
  authMiddleware,
  async (c) => {
    // get request token from URL params
    const token = c.req.param("requestToken");

    // chech and update
    // return the response
    try {
      const tokenExist = await friendshipService.findToken(token);
      if (!tokenExist) {
        throw new Error("Token not found");
      }
      friendshipService.updateStatus(token, "rejected");
      return c.json(createSuccessResponse("Request friend rejected"));
    } catch (error) {
      if (error instanceof Error) {
        return c.json(createErrorResponse(error.message), 400);
      }
    }
  },
);

friendshipRoutes.get("/friends", authMiddleware, async (c) => {
  // get current user id
  const currentUser = c.get("user");
  try {
    const friendList = await friendshipService.getFriendList(
      currentUser.sub,
      "accepted",
    );
    return c.json(createSuccessResponse("success retrive friend", friendList));
  } catch (error) {
    if (error instanceof Error) {
      return c.json(createErrorResponse(error.message), 400);
    }
  }
});
export { friendshipRoutes };

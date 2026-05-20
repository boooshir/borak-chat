import { Hono } from "hono";
import {
  authMiddleware,
  LoginParams,
  RegisterParams,
  validateLogin,
  validateRegister,
  validateUserUpdate,
} from "../middleware/auth.middlware";
import { UserService } from "../../../domain/user/user.service";
import { UserRepositoryImpl } from "../../../infrastructure/repositories/user.repositoryimpl";
import {
  createErrorResponse,
  createSuccessResponse,
} from "../../../shared/utils/response.util";
import { AuthService } from "../../../domain/auth/auth.service";
import { AuthRepositoryImpl } from "../../../infrastructure/repositories/auth.repositoryimpl";
import { Prisma } from "../../../../generated/prisma";
import { UpdateUserData } from "../../../domain/user/user.model";
import { generatePublicId } from "../../../shared/utils/generateRandomId";

// returning type from middleware
type Variables = {
  validateLoginData: LoginParams;
  validateRegisterData: RegisterParams;
  validateUserUpdate: UpdateUserData;
  user: {
    sub: number;
    publicId: string;
  };
};

// initialize services
const authservice = AuthService(
  UserService(UserRepositoryImpl),
  AuthRepositoryImpl,
);

// initialize hono route
const authRoutes = new Hono<{ Variables: Variables }>();

authRoutes.post("/login", validateLogin, async (c) => {
  const validate = c.get("validateLoginData");
  try {
    const result = await authservice.login(validate);
    return c.json(createSuccessResponse("Success", result));
  } catch (error: any) {
    console.log({ error });
    return c.json(createErrorResponse(error?.message), 400);
  }
});

authRoutes.post("/register", validateRegister, async (c) => {
  const validate = c.get("validateRegisterData");
  const publicId = await generatePublicId();
  if (!publicId) {
    return c.json(createErrorResponse("failed to generate publicId"), 400);
  }
  try {
    await authservice.register({ ...validate, publicId: publicId });
    return c.json(createSuccessResponse("you successful registered"));
  } catch (error: any) {
    return c.json(createErrorResponse(error?.message), 400);
  }
});

authRoutes.get("/me", authMiddleware, async (c) => {
  const { sub } = c.get("user");
  try {
    const user = await authservice.me(sub);
    return c.json(createSuccessResponse("success", user));
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      return c.json(createErrorResponse("Something wrong", error.message), 400);
    } else if (error instanceof Error) {
      return c.json(
        createErrorResponse("Something wrong", error?.message),
        400,
      );
    }
  }
});
authRoutes.put("/me", authMiddleware, validateUserUpdate, async (c) => {
  const currentUser = c.get("user");
  const validated = c.get("validateUserUpdate");
  try {
    const user = await authservice.updatUser(
      {
        username: validated.username,
        email: validated.email,
        password: validated.password,
      },
      currentUser.sub,
    );
    return c.json(createSuccessResponse("success", user));
  } catch (error) {
    if (error instanceof Error) {
      return c.json(createErrorResponse(error.message), 400);
    }
  }
});

export { authRoutes };

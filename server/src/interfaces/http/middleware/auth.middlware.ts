import { z } from "zod";
import { createErrorResponse } from "../../../shared/utils/response.util";
import { createMiddleware } from "hono/factory";
import { verify } from "hono/jwt";
import { UserService } from "../../../domain/user/user.service";
import { UserRepositoryImpl } from "../../../infrastructure/repositories/user.repositoryimpl";
import {
  loginSchema,
  registerSchema,
  userUpdateSchema,
} from "../../../domain/user/user.schema";
import { mergeFieldErrors } from "../../../shared/utils/mergeFieldErrors";

// initialize services
const userService = UserService(UserRepositoryImpl);

// middleware business logic
export const validateLogin = createMiddleware(async (c, next) => {
  const data = await c.req.json();
  const result = loginSchema.safeParse(data);

  if (!result.success) {
    return c.json(
      createErrorResponse("input error", result.error.flatten().fieldErrors),
      400,
    );
  }
  c.set("validateLoginData", result.data);
  return next();
});

export const validateRegister = createMiddleware(async (c, next) => {
  const data = await c.req.json();
  const result = registerSchema.safeParse(data);

  const customErrors: Record<string, string[]> = {};

  if (result.success === false) {
    return c.json(
      createErrorResponse("Fields error", result.error.flatten().fieldErrors),
      400,
    );
  }

  // check user unique
  const usernameExist = await userService.findByUsername(result.data.username);
  if (usernameExist) {
    customErrors.username = ["Username is already taken"];
  }
  if (result.data.email) {
    const emailExist = await userService.findByEmail(result.data.email);
    if (emailExist) {
      customErrors.email = ["Email is already taken"];
    }
  }
  if (Object.keys(customErrors).length > 0) {
    return c.json(
      createErrorResponse("Fields error", mergeFieldErrors({}, customErrors)),
    );
  }
  c.set("validateRegisterData", result.data);
  await next();
});

export const validateUserUpdate = createMiddleware(async (c, next) => {
  const data = await c.req.json();
  const result = userUpdateSchema.safeParse(data);
  if (!result.success) {
    return c.json(
      createErrorResponse("Error", result.error.flatten().fieldErrors),
      400,
    );
  }

  const customErrors: Record<string, string[]> = {};
  // check user unique
  if (result.data.username) {
    const usernameExist = await userService.findByUsername(
      result.data.username,
    );
    if (usernameExist) {
      customErrors.username = ["Username is already taken"];
    }
  }
  if (result.data.email) {
    const emailExist = await userService.findByEmail(result.data.email);
    if (emailExist) {
      customErrors.email = ["Email is already taken"];
    }
  }
  if (Object.keys(customErrors).length > 0) {
    return c.json(
      createErrorResponse("Fields error", mergeFieldErrors({}, customErrors)),
    );
  }

  c.set("validateUserUpdate", result.data);
  await next();
});

// authentication middleware
export const authMiddleware = createMiddleware(async (c, next) => {
  const token = c.req.header("Authorization")?.split(" ")[1];
  if (!token) {
    return c.json(createErrorResponse("Invalid Credentials"), 401);
  }
  const payload = await verify(token, Bun.env.JWT_SECRET!);
  if (payload.sub === undefined || payload.publicId === undefined) {
    return c.json(createErrorResponse("Invalid Credentials"), 401);
  }
  c.set("user", { sub: payload.sub, publicId: payload.publicId });
  await next();
});

export type LoginParams = z.infer<typeof loginSchema>;
export type RegisterParams = z.infer<typeof registerSchema>;

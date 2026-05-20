import { CreateUserData, UpdateUserData, UserType } from "../user/user.model";
import { UserService } from "../user/user.service";
import { AuthCredentials, AuthResult } from "./auth.model";
import { type AuthRepository } from "./auth.repository";

export const AuthService = (
  userservice: ReturnType<typeof UserService>,
  authRepo: AuthRepository,
) => ({
  login: async (credentials: AuthCredentials): Promise<AuthResult> => {
    const user = await userservice.findByUsername(credentials.username);
    if (!user) throw new Error("Invalid username or password");

    const isValid = await authRepo.comparePassword(
      credentials.password,
      user.passwordHash,
    );
    if (!isValid) throw new Error("Invalid username or password");

    const token = await authRepo.genereteToken(user.id, user.publicId);
    return { token };
  },
  register: async (input: CreateUserData): Promise<{ message: string }> => {
    const existUser = await userservice.findByUsername(input.username);
    if (existUser) throw new Error("User already exists");
    if (input.email !== undefined) {
      if (input.email !== "") {
        console.log("hello from login");
        const existEmail = await userservice.findByEmail(input.email);
        if (existEmail) throw new Error("User already exists");
      }
    }
    const hashed = await authRepo.hashPassword(input.password);
    await userservice.create({
      publicId: input.publicId,
      username: input.username,
      email: input.email,
      password: hashed,
    });

    return { message: "success" };
  },
  me: async (
    userId: number,
  ): Promise<Omit<UserType, "id" | "passwordHash">> => {
    const user = await userservice.findByIdWithoutPassowrd(userId);
    if (!user) throw new Error("User Not Found");
    return {
      publicId: user.publicId,
      username: user.username,
      email: user.email,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  },
  updatUser: async (input: UpdateUserData, userId: number) => {
    const user = await userservice.findById(userId);
    if (!user) throw new Error("User not found");
    // check the unique is available
    const hash = await authRepo.hashPassword(input.password);
    const updated = await userservice.update(
      { ...input, password: hash },
      userId,
    );
    return updated;
  },
});

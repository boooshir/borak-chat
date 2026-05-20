import { sign } from "hono/jwt";
import { AuthRepository } from "../../domain/auth/auth.repository";

export const AuthRepositoryImpl: AuthRepository = {
  hashPassword: async (plain) =>
    await Bun.password.hash(plain, {
      algorithm: "argon2id",
      memoryCost: 19456,
      timeCost: 2,
    }),
  comparePassword: async (plain, hash) =>
    await Bun.password.verify(plain, hash),
  genereteToken: async (userId, publicId) =>
    await sign(
      {
        sub: userId,
        publicId: publicId,
        exp: Math.floor(Date.now() / 1000) + 60 * 60 * 60 * 2,
      },
      Bun.env.JWT_SECRET!,
      "HS256",
    ),
};

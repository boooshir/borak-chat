import {
  CreateUserData,
  UpdateUserData,
  UserType,
} from "../../domain/user/user.model";
import { UserRepository } from "../../domain/user/user.repository";
import { prisma } from "../db/db";

export const UserRepositoryImpl: UserRepository = {
  create: async (data: CreateUserData): Promise<UserType | null> => {
    return await prisma.user.create({
      data: {
        publicId: data.publicId,
        username: data.username,
        email: data.email,
        passwordHash: data.password,
      },
    });
  },
  update: async (
    data: UpdateUserData,
    userId: number,
  ): Promise<Omit<UserType, "passwordHash">> => {
    return await prisma.user.update({
      select: {
        id: true,
        publicId: true,
        username: true,
        email: true,
        createdAt: true,
        updatedAt: true,
      },
      data: {
        username: data.username,
        email: data.email,
        passwordHash: data.password,
      },
      where: {
        id: userId,
      },
    });
  },
  findById: async (id: number): Promise<UserType | null> => {
    return await prisma.user.findUnique({ where: { id } });
  },
  findByPublicId: async (
    publicId: string,
  ): Promise<Omit<UserType, "passwordHash"> | null> => {
    return await prisma.user.findUnique({
      where: { publicId: publicId },
      select: {
        id: true,
        publicId: true,
        username: true,
        email: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  },
  findByUsername: async (username: string): Promise<UserType | null> => {
    const response = await prisma.user.findFirst({ where: { username } });
    return response;
  },
  findByEmail: async (email: string): Promise<UserType | null> => {
    return await prisma.user.findFirst({ where: { email } });
  },
  findAll: async (): Promise<UserType[]> => {
    return await prisma.user.findMany();
  },
  findByIdWithoutPassword: async (
    id: number,
  ): Promise<Omit<UserType, "passwordHash"> | null> => {
    return await prisma.user.findFirst({
      where: { id },
      select: {
        id: true,
        publicId: true,
        username: true,
        email: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  },
  isFriend: async (requesterId: number, requesteeId: number) => {
    const isFriend = await prisma.friendship.findFirst({
      where: {
        status: "accepted",
        OR: [
          { requesterId: requesterId, requesteeId: requesteeId },
          { requesterId: requesteeId, requesteeId: requesterId },
        ],
      },
    });
    if (isFriend === null) {
      return false;
    }
    return true;
  },
};

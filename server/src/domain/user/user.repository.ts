import { CreateUserData, UpdateUserData, UserType } from "./user.model";

export type UserRepository = {
  create: (data: CreateUserData) => Promise<UserType | null>;
  update: (
    data: UpdateUserData,
    userId: number,
  ) => Promise<Omit<UserType, "passwordHash"> | null>;
  findById: (id: number) => Promise<UserType | null>;
  findByPublicId: (
    publicId: string,
  ) => Promise<Omit<UserType, "passwordHash"> | null>;
  findByIdWithoutPassword: (
    id: number,
  ) => Promise<Omit<UserType, "passwordHash"> | null>;
  findByUsername: (username: string) => Promise<UserType | null>;
  findByEmail: (email: string) => Promise<UserType | null>;
  findAll: () => Promise<UserType[]>;
  isFriend: (requesterId: number, requesteeId: number) => Promise<boolean>;
};

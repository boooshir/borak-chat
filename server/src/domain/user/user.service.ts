import { CreateUserData, UpdateUserData, UserType } from "./user.model";
import { UserRepository } from "./user.repository";

export const UserService = (repo: UserRepository) => ({
  create: (data: CreateUserData): Promise<UserType | null> => repo.create(data),
  update: (
    data: UpdateUserData,
    userId: number,
  ): Promise<Omit<UserType, "passwordHash"> | null> =>
    repo.update(data, userId),
  getAll: (): Promise<UserType[]> => repo.findAll(),
  findById: (id: number): Promise<UserType | null> => repo.findById(id),
  findByPublicId: (
    publicId: string,
  ): Promise<Omit<UserType, "passwordHash"> | null> =>
    repo.findByPublicId(publicId),
  findByIdWithoutPassowrd: (
    id: number,
  ): Promise<Omit<UserType, "passwordHash"> | null> =>
    repo.findByIdWithoutPassword(id),
  findByUsername: (username: string): Promise<UserType | null> =>
    repo.findByUsername(username),
  findByEmail: (email: string): Promise<UserType | null> =>
    repo.findByEmail(email),
  isFriend: (requesterId: number, requesteeId: number): Promise<boolean> =>
    repo.isFriend(requesterId, requesteeId),
});

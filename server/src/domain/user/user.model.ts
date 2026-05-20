export interface CreateUserData {
  publicId: string;
  username: string;
  email?: string;
  password: string;
}

export interface UpdateUserData {
  username: string;
  email?: string;
  password: string;
}

export interface UserType {
  id: number;
  publicId: string;
  username: string;
  email?: string | null;
  passwordHash: string;
  createdAt: Date;
  updatedAt: Date;
}

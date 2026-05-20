export interface UserType {
  publicId: string;
  username: string;
  email?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface AuthResponseType {
  success: boolean;
  message: string;
  data?: UserType;
}

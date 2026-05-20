export interface ResponseStatusType {
  status: string;
  createdAt: Date;
  token: string;
  requestee?: {
    publicId: string;
    username: string;
  };
  requester?: {
    publicId: string;
    username: string;
  };
}

export interface FriendRequestStatus {
  status: boolean;
  message: string;
  data: ResponseStatusType[];
}

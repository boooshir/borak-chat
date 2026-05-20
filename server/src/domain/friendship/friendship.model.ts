export type FriendshipRequestInput = {
  requesterId: number;
  requesteeId: number;
};

export type IncomingListType = {
  status: string;
  createdAt: Date;
  token: string | null;
  requester: {
    publicId: string;
    username: string;
  };
};

export type OutgoingListType = {
  status: string;
  createdAt: Date;
  requestee: {
    publicId: string;
    username: string;
  };
};

export type FriendListType = {
  publicId: string;
  username: string;
  createdAt: Date;
};

export type FriendshipType = {
  id: number;
  token?: string | null;
  requesterId: number;
  requesteeId: number;
  status: string;
  createdAt: Date;
  updatedAt: Date;
};

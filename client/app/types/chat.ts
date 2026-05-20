export type Friend = {
  id: string;
  name: string;
  avatar: string;
  isOnline: boolean;
  lastSeen: string;
};

export type Room = {
  publicId: string;
  name: string;
  totalMember: string;
  lastMessages: string;
  isPrivate: boolean;
};

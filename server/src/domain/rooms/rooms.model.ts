export type CreateRoomsResponse = {
  publicId: string;
  creatorId: number;
  name: string;
  isPrivate: boolean;
};
export type ListRoomsResponse = {
  publicId: number;
  name: string;
  lastMessage?: string | null;
  lastMessageCreated?: Date | null;
  totalMember: string;
  isPrivate: boolean;
};
export type FindMemberResponse = {
  id?: number;
  isAdmin?: boolean;
  username?: string;
};
export type MembersListResponse = {
  publicId: string;
  username: string;
  isAdmin: boolean;
};

export type RoomDetailsResponse = {
  id: number;
  publicId: string;
  name: string;
};

export type RoomMessagesResponse = {
  id: number;
  sender: string;
  content: string;
  createdAt: Date;
  isOwn: boolean;
};

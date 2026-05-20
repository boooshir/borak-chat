import {
  FriendListType,
  FriendshipType,
  IncomingListType,
  OutgoingListType,
} from "./friendship.model";

export type FriendshipRespository = {
  create: (
    requesterId: number,
    requesteeId: number,
  ) => Promise<Response | Error | undefined>;
  findIncomingList: (userId: number) => Promise<IncomingListType[]>;
  findOutgoingList: (userId: number) => Promise<OutgoingListType[]>;
  findFriend: (requesteeId: number) => Promise<FriendshipType | null>;
  findToken: (token: string) => Promise<Pick<FriendshipType, "id"> | null>;
  updateStatus: (token: string, status: string) => void;
  friendList: (userId: number, status: string) => Promise<FriendListType[]>;
};

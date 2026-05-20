export type GetDirectMessageResponse = {
  id: number;
  content: string;
  isRead: boolean;
  isOwn: boolean;
  createdAt: Date;
  sender: string;
};

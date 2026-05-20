import { useMatches } from "react-router";

export interface UserData {
  success: boolean;
  message: string;
  data: {
    publicId: string;
    username: string;
    email: string;
    createdAt: Date;
    updatedAt: Date;
  };
}
export interface ChatLayoutData {
  user: UserData;
  WS_URL: string;
}

export function useLayoutData(): ChatLayoutData {
  const matches = useMatches();
  const layoutMatch = matches.find((match) => match.id === "routes/layout") as {
    data: ChatLayoutData;
  };
  return layoutMatch?.data;
}

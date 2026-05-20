import React, { createContext, useContext } from "react";
import type { Friend, Room } from "~/types/chat";

interface ChatContextType {
  // friends data
  friends: Friend[];
  setFriends: (friends: Friend[]) => void;
  friendsLoading: boolean;
  setFriendsLoading: (loading: boolean) => void;
  // rooms data
  rooms: Room[];
  setRooms: (rooms: Room[]) => void;
  roomsLoading: boolean;
  setRoomsLoading: (loading: boolean) => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export function useChatContext() {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error("useContext must be used within a ChatProvider");
  }
  return context;
}

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const [friends, setFriends] = React.useState<Friend[]>([]);
  const [friendsLoading, setFriendsLoading] = React.useState(false);

  const [rooms, setRooms] = React.useState<Room[]>([]);
  const [roomsLoading, setRoomsLoading] = React.useState(false);

  return (
    <ChatContext.Provider
      value={{
        friends,
        setFriends,
        friendsLoading,
        setFriendsLoading,
        rooms,
        setRooms,
        roomsLoading,
        setRoomsLoading,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
}

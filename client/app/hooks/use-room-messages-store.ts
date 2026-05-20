import { create } from "zustand";

interface Message {
  id: number;
  sender: string;
  content: string;
  createdAt: Date;
  isOwn: boolean;
}
interface RoomMessageStoreType {
  messages: Message[];
  setMessages: (value: Message[]) => void;
  addMessage: (value: Message) => void;
  prependMessages: (value: Message[]) => void;
  clearAll: () => void;
}

export const useRoomMessagesStore = create<RoomMessageStoreType>((set) => ({
  messages: [],
  setMessages: (messages) => {
    set(() => ({
      messages: messages,
    }));
  },
  addMessage: (newMessage) => {
    set((state) => {
      if (state.messages.some((msg) => msg.id === newMessage.id)) {
        return { messages: state.messages };
      }
      return {
        messages: [...new Set([...state.messages, newMessage])],
      };
    });
  },
  prependMessages: (messages) => {
    set((state) => ({
      messages: [...new Set([...messages, ...state.messages])],
    }));
  },
  clearAll: () => {
    set(() => ({
      messages: [],
    }));
  },
}));

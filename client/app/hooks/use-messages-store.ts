import { create } from "zustand";

interface Message {
  id: number;
  content: string;
  isRead: boolean;
  isOwn: boolean;
  createdAt: Date;
  sender: string;
}

interface MessagesType {
  messages: Message[];
  setMessages: (value: Message[]) => void;
  addMessage: (value: Message) => void;
  prependMessages: (messages: Message[]) => void;
  clearAll: () => void;
}

export const useMessagesStore = create<MessagesType>((set) => ({
  messages: [],
  setMessages: (messagesData) => {
    set(() => ({
      messages: messagesData,
    }));
  },
  addMessage: (newMessage) => {
    set((state) => {
      if (state.messages.some((msg) => msg.id === newMessage.id)) {
        return {
          messages: state.messages,
        };
      }
      return {
        messages: [...new Set([...state.messages, newMessage])],
      };
    });
  },
  prependMessages: (newMessages) => {
    set((state) => ({
      messages: [...new Set([...newMessages, ...state.messages])],
    }));
  },
  clearAll: () => set({ messages: [] }),
}));

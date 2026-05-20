import { create } from "zustand";

interface TypingState {
  typingStatus: Record<string, boolean>;
  setTypingStatus: (senderPublicId: string, isTyping: boolean) => void;
  reset: () => void;
}

export const useTypingStore = create<TypingState>((set) => ({
  typingStatus: {},
  setTypingStatus: (senderPublicId, isTyping) =>
    set((state) => ({
      typingStatus: {
        ...state.typingStatus,
        [senderPublicId]: isTyping,
      },
    })),
  reset: () => set({ typingStatus: {} }),
}));

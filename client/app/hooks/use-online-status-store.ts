import { create } from "zustand";

export type UserPresence = {
  isOnline: boolean;
  isInChat?: boolean;
  isInThisChat?: boolean;
};
export type OnlineStatusMap = Record<string, UserPresence>;
export type PresenceUpdateMessage = {
  type: "presence_update";
  userPublicId: string;
  presence: UserPresence;
};

type OnlineStatusState = {
  statuses: Record<string, UserPresence>;
  getStatus: (userPublicId: string) => UserPresence | undefined;
  updateStatus: (userPublicId: string, presence: UserPresence) => void;
  clearAll: () => void;
};

export const useOnlineStatusStore = create<OnlineStatusState>((set, get) => ({
  statuses: {},
  getStatus: (userPublicId) => get().statuses[userPublicId],
  updateStatus: (userPublicId, presence) => {
    set((state) => ({
      statuses: {
        ...state.statuses,
        [userPublicId]: presence,
      },
    }));
  },
  clearAll: () => set({ statuses: {} }),
}));

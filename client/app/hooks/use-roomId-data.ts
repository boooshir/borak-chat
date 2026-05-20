import { useMatches } from "react-router";

export function useRoomIdData(): string | null {
  const matches = useMatches();

  const dmMatch = matches.find((m) => m.pathname.startsWith("/rooms/"));
  return dmMatch?.params.roomId ?? null;
}

import { useMatches } from "react-router";

export function useFriendIdFromRoute(): string | null {
  const matches = useMatches();

  const dmMatch = matches.find((m) =>
    m.pathname.startsWith("/direct-message/"),
  );
  return dmMatch?.params.friendId ?? null;
}

import React from "react";
import { useChatContext } from "~/components/chat-provider";
import { ChatWelcome } from "~/components/chat-welcome";
import type { Route } from "./+types/rooms";

// Mock data for rooms
export async function loader({ request }: Route.LoaderArgs) {
  const { authUser } = await import("~/lib/session.server");
  const { token } = await authUser(request);
  const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/rooms`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
  const result = await response.json();
  return { rooms: result.data };
}

export async function action({ request }: Route.ActionArgs) {
  const { authUser } = await import("~/lib/session.server");
  const { token } = await authUser(request);

  const formData = await request.formData();
  const roomName = formData.get("roomName");
  const isPrivate = formData.get("isPrivate") !== null;
  const intent = formData.get("intent");
  if (intent === "create-room") {
    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/rooms`, {
      method: "post",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ name: roomName, isPrivate }),
    });
    const result = await response.json();

    return { ...result };
  }

  return;
}
export default function RoomsRoute({ loaderData }: Route.ComponentProps) {
  const { rooms, setRooms, roomsLoading, setRoomsLoading } = useChatContext();

  React.useEffect(() => {
    if (rooms.length === 0 && !roomsLoading) {
      setRoomsLoading(true);
      setRooms(loaderData.rooms);
      setRoomsLoading(false);
    }
  }, []);

  return <ChatWelcome />;
}

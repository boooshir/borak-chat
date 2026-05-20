import { createContext, useContext, useEffect, useRef } from "react";
import { useLayoutData } from "~/hooks/use-layout-data";
import { useMessagesStore } from "~/hooks/use-messages-store";
import { useOnlineStatusStore } from "~/hooks/use-online-status-store";
import { useRoomMessagesStore } from "~/hooks/use-room-messages-store";
import { useRoomIdData } from "~/hooks/use-roomId-data";
import { useTypingStore } from "~/hooks/use-typing-store";
import { useFriendIdFromRoute } from "~/hooks/user-friendId-from-route";

export type DirectMessageResponse = {
  id: number;
  content: string;
  isRead: boolean;
  isOwn: boolean;
  createdAt: Date;
  sender: string;
};
export const WebSocketContext = createContext<{
  send: (message: any) => void;
} | null>(null);

export const useWebSocketContext = () => {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error("useWebsocket must be used within a WebSocketProvider");
  }
  return context;
};

export function ChatwebSocketProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const friendId = useFriendIdFromRoute();
  const roomId = useRoomIdData();
  const { WS_URL } = useLayoutData();
  const prevFriendIdRef = useRef<string | null>(null);
  const prevRoomIdRef = useRef<string | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const addMessage = useMessagesStore((state) => state.addMessage);
  const addRoomMessage = useRoomMessagesStore((state) => state.addMessage);

  const send = (message: any) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message));
    }
  };
  // this use effect run on refresh
  useEffect(() => {
    const connect = () => {
      const ws = new WebSocket(WS_URL);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log("Websocket connected");
        // ws.send(JSON.stringify({ type: "ping" }))
        ws.send(
          JSON.stringify({
            type: "presence",
            payload: {
              isInChat: true,
            },
          }),
        );
        ws.send(
          JSON.stringify({
            type: "chat_focus",
            payload: { targetPublicId: friendId },
          }),
        );
        ws.send(
          JSON.stringify({
            type: "join_room",
            roomId,
          }),
        );
      };
      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          switch (data.type) {
            case "NEW_MESSAGE":
              if (
                data.userPublicId === friendId ||
                data.senderPublicId === friendId
              ) {
                const newMessage: DirectMessageResponse = {
                  id: data.payload.id,
                  content: data.payload.content,
                  isRead: data.payload.isRead,
                  isOwn: data.payload.isOwn,
                  createdAt: data.payload.createdAt,
                  sender: data.payload.sender,
                };
                addMessage(newMessage);
              }
              break;
            case "NEW_ROOM_MESSAGE":
              if (data.roomPublicId === roomId) {
                const payload = data.payload;
                const newMessage = {
                  id: payload.id,
                  content: payload.content,
                  sender: payload.sender,
                  isOwn: data.userPublicId !== friendId,
                  isRead: true,
                  createdAt: new Date(),
                };
                addRoomMessage(newMessage);
              }
              break;

            case "presence_update":
              // console.log("📨 presence_update", data.userPublicId);
              useOnlineStatusStore
                .getState()
                .updateStatus(data.userPublicId, data.presence);
              break;
            case "typing_status":
              useTypingStore
                .getState()
                .setTypingStatus(data.senderPublicId, data.isTyping);
              break;
          }
        } catch (error) {
          console.error("Error parsing Websocket message: ", error);
        }
      };
      ws.onclose = () => {
        console.log("websocket disconnected, Reconnecting...");
        setTimeout(connect, 3000);
      };

      ws.onerror = (error) => {
        console.log("Websocket error: ", error);
      };
    };

    connect();
    return () => {
      // 1. clear focus
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send(
          JSON.stringify({
            type: "chat_focus",
            payload: {
              targetPublicId: friendId,
              // isFocusing: false,
            },
          }),
        );

        // 2. exit chat area
        wsRef.current?.send(
          JSON.stringify({
            type: "presence",
            payload: {
              isInChat: false,
            },
          }),
        );
      }
      // 3. Close connection
      wsRef.current?.close(1000, "Client navigated away");
    };
  }, [WS_URL]);
  // this code will run when user change
  // user switch user A to user B without refresh the page
  useEffect(() => {
    const ws = wsRef.current;
    const prevFriend = prevFriendIdRef.current;
    const prevRoom = prevRoomIdRef.current;

    if (!ws || ws.readyState !== WebSocket.OPEN) return;

    // skip if friendPublicId is the current user's own ID
    // 1. clear previous focus friendId
    if (prevFriend) {
      // console.log(`↩️ unfocus ${prevFriend}`);
      ws.send(
        JSON.stringify({
          type: "chat_focus",
          payload: {
            targetPublicId: null,
          },
        }),
      );
    }
    if (prevRoom) {
      // console.log(`↩️ unfocus ${prevRoom}`);
      ws.send(
        JSON.stringify({
          type: "join_room",
          roomId: null,
        }),
      );
    }
    // console.log(`👁️  focus ${friendId}`);
    // 2. focus on active user(receive message, set typing, )
    if (friendId || roomId) {
      // set frind userid focus
      ws.send(
        JSON.stringify({
          type: "chat_focus",
          payload: {
            targetPublicId: friendId,
          },
        }),
      );
      // set room id focus
      ws.send(
        JSON.stringify({
          type: "join_room",
          roomId: roomId,
        }),
      );
      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          switch (data.type) {
            case "NEW_MESSAGE":
              if (
                data.userPublicId === friendId ||
                data.senderPublicId === friendId
              ) {
                const newMessage: DirectMessageResponse = {
                  id: data.payload.id,
                  content: data.payload.content,
                  isRead: data.payload.isRead,
                  isOwn: data.payload.isOwn,
                  createdAt: data.payload.createdAt,
                  sender: data.payload.sender,
                };
                addMessage(newMessage);
              }
              break;
            case "NEW_ROOM_MESSAGE":
              if (data.roomPublicId === roomId) {
                const payload = data.payload;
                const newMessage = {
                  id: payload.id,
                  content: payload.content,
                  sender: payload.sender,
                  isOwn: data.userPublicId !== friendId,
                  isRead: true,
                  createdAt: new Date(),
                };
                addRoomMessage(newMessage);
              }
              break;

            case "presence_update":
              // console.log("📨 presence_update", data.userPublicId);
              useOnlineStatusStore
                .getState()
                .updateStatus(data.userPublicId, data.presence);
              break;
            case "typing_status":
              useTypingStore
                .getState()
                .setTypingStatus(data.senderPublicId, data.isTyping);
              break;
          }
        } catch (error) {
          console.error("Error parsing Websocket message: ", error);
        }
      };
    }

    prevFriendIdRef.current = friendId;
  }, [friendId, roomId]);

  return (
    <WebSocketContext.Provider value={{ send }}>
      {children}
    </WebSocketContext.Provider>
  );
}

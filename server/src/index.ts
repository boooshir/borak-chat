import { Hono } from "hono";
import { logger } from "hono/logger";
import { authRoutes } from "./interfaces/http/routes/auth.route";
import { prettyJSON } from "hono/pretty-json";
import { friendshipRoutes } from "./interfaces/http/routes/friendship.route";
import { messagesRoutes } from "./interfaces/http/routes/messages.route";
import { roomsRoutes } from "./interfaces/http/routes/rooms.route";
import { HTTPException } from "hono/http-exception";
import { verify } from "hono/jwt";
import {
  addConnection,
  addFriendship,
  handleRoomJoin,
  removeConnection,
  setChatAreaPresence,
  setChatFocus,
  setTypingStatus,
  WebSocketData,
} from "./infrastructure/ws/websocketManager";
import { serve, ServerWebSocket } from "bun";

const app = new Hono();

// global error
app.onError((err, c) => {
  if (err instanceof HTTPException) {
    return c.json(
      {
        success: false,
        message: err.message,
      },
      err.status,
    );
  }
  return c.json(
    {
      success: false,
      message: "Internal Server Error",
    },
    500,
  );
});

app.use("*", prettyJSON());
app.use(logger());
app.route("/api/auth", authRoutes);
app.route("/api", friendshipRoutes);
app.route("/api", messagesRoutes);
app.route("/api", roomsRoutes);
// app.route("/ws", wsRouter);
app.get("/", (c) => {
  return c.text("Hello Hono!");
});

const serverConfig = {
  port: process.env.PORT || 3000,
  fetch: async (req: Request, server: any) => {
    const url = new URL(req.url);
    // Handle WebSocket upgrade
    if (url.pathname === "/ws") {
      // Get token from cookies
      const token = url.searchParams.get("token");
      if (!token) return new Response("Unauthorized", { status: 401 });
      try {
        const user = await verify(token, Bun.env.JWT_SECRET!);
        if (!user) return new Response("Unauthorized", { status: 401 });

        // Upgrade to WebSocket with user data
        if (
          server.upgrade(req, {
            data: { userId: user.sub, userPublicId: user.publicId },
          })
        ) {
          return new Response();
        }
        return new Response("Upgrade failed", { status: 400 });
      } catch (error) {
        return new Response("Authentication failed", { status: 401 });
      }
    }
    // All other requests go to Hono app
    return app.fetch(req);
  },
  websocket: {
    open(ws: ServerWebSocket<WebSocketData>) {
      const { userPublicId } = ws.data;
      console.log(`WebSocket connected: ${userPublicId}`);
      addConnection(userPublicId, ws);
    },
    message(ws: ServerWebSocket<WebSocketData>, message: any) {
      // Handle ping/pong
      const parsed = JSON.parse(message);
      const { userPublicId } = ws.data;

      if (parsed.type === "ping") {
        ws.send(JSON.stringify({ type: "pong" }));
      }
      // handle online status
      if (parsed.type === "presence") {
        setChatAreaPresence(userPublicId, parsed.payload.isInChat);
      }
      // handler focus in chat status
      if (parsed.type === "chat_focus") {
        const targetPublicId = parsed.payload.targetPublicId;
        if (targetPublicId) {
          addFriendship(userPublicId, targetPublicId);
        }
        setChatFocus(userPublicId, targetPublicId);
      }
      // handle typing status
      if (parsed.type === "typing_start") {
        const targetPublicId = parsed.payload.targetPublicId;
        setTypingStatus(userPublicId, targetPublicId, true);
      }
      if (parsed.type === "typing_stop") {
        const targetPublicId = parsed.payload.targetPublicId;
        setTypingStatus(userPublicId, targetPublicId, false);
      }
      if (parsed.type === "join_room") {
        handleRoomJoin(ws, { userPublicId, roomId: parsed.roomId });
      }
    },
    async close(ws: ServerWebSocket<WebSocketData>) {
      const { userPublicId } = ws.data;
      console.log(`WebSocket disconnected: ${userPublicId}`);

      await removeConnection(userPublicId, ws);
    },
    error(_ws: ServerWebSocket<WebSocketData>, error: Error) {
      console.error("WebSocket error:", error);
    },
  },
  // Keep all your Bun-specific configurations
  watch: process.env.NODE_ENV === "development",
  smol: true,
  tsconfig: "./tsconfig.json",
  // Add any other Bun server options you need
  development: process.env.NODE_ENV !== "production",
};

serve(serverConfig);
console.log(`Server running on port ${serverConfig.port}`);

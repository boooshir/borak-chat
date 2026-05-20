import {
  type RouteConfig,
  index,
  layout,
  route,
} from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  layout("routes/layout.tsx", [
    route("/direct-message", "routes/direct-message.tsx", [
      route(":friendId", "routes/direct-message.$friendId.tsx"),
    ]),
    route("/rooms", "routes/rooms.tsx", [
      route(":roomId", "routes/rooms.$roomId.tsx"),
    ]),
    route("/request", "routes/request.tsx"),
    route("/request/:status", "routes/request.$status.tsx"),
  ]),
  route("/request-friend", "routes/request-friend.tsx"),
  route("/login", "routes/login.tsx"),
  route("/set-theme", "routes/set-theme.ts"),
  route("/register", "routes/register.tsx"),
  route("/logout", "routes/logout.ts"),
] satisfies RouteConfig;

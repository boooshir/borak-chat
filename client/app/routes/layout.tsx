import { data, Outlet, type LoaderFunctionArgs } from "react-router";
import { AppSidebar } from "~/components/app-sidebar";
import { ChatProvider } from "~/components/chat-provider";
import { ChatwebSocketProvider } from "~/components/chat-websocket";
import { SidebarProvider } from "~/components/ui/sidebar";
import type { AuthResponseType } from "~/types/user";

export async function loader({ request }: LoaderFunctionArgs) {
  const { authUser, destroySession } = await import("~/lib/session.server");
  const { session, token } = await authUser(request);
  const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/auth/me`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  const result: AuthResponseType = await response.json();
  if (result.success === false) {
    return data(
      {},
      {
        headers: {
          "Set-Cookie": await destroySession(session),
        },
      },
    );
  }
  const url = new URL(request.url);
  const wsProtocol = url.protocol === "http:" ? "ws" : "wss";
  const WS_URL = `${wsProtocol}://192.168.0.12:3000/ws?token=${token}`;
  return { user: result, WS_URL };
}

export default function Layout() {
  return (
    <ChatwebSocketProvider>
      <ChatProvider>
        <SidebarProvider>
          <div className="flex w-full">
            <AppSidebar />
            <main className="flex h-dvh min-w-0 flex-1 flex-col">
              <Outlet />
            </main>
          </div>
        </SidebarProvider>
      </ChatProvider>
    </ChatwebSocketProvider>
  );
}

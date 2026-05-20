import { redirect } from "react-router";
import type { Route } from "./+types/request";

export async function loader({ request }: Route.LoaderArgs) {
  const { authUser } = await import("~/lib/session.server");
  await authUser(request);

  const url = new URL(request.url);
  if (url.pathname === "/request") {
    return redirect("/request/incoming");
  }
  return;
}

import { data, type ActionFunctionArgs } from "react-router";

export async function action({ request }: ActionFunctionArgs) {
  const { getSession, destroySession } = await import("~/lib/session.server");
  const session = await getSession(request.headers.get("Cookie"));
  if (session.has("__session")) {
    return data(
      {
        success: true,
      },
      {
        headers: { "Set-Cookie": await destroySession(session) },
      },
    );
  }
  return {
    success: false,
  };
}

import { createCookieSessionStorage, redirect } from "react-router";

const SESSION_SECRET = import.meta.env.VITE_SESSION_SECRET as string;
const { getSession, commitSession, destroySession } =
  createCookieSessionStorage({
    cookie: {
      name: "__session",
      sameSite: "lax",
      path: "/",
      httpOnly: true,
      secrets: [SESSION_SECRET],
      secure: import.meta.env.NODE_ENV === "production",
    },
  });

export { getSession, commitSession, destroySession };

export async function getToken(request: Request) {
  const session = await getSession(request.headers.get("Cookie"));
  const sessionData = await session.get("__session");
  if (!sessionData) throw await logout(request);
  const token = sessionData.token;
  if (!token) throw await logout(request);
  return { session, token };
}

export async function logout(request: Request) {
  const session = await getSession(request.headers.get("Cookie"));
  return redirect("/login", {
    headers: {
      "Set-Cookie": await destroySession(session),
    },
  });
}

export async function authUser(request: Request) {
  const session = await getSession(request.headers.get("Cookie"));
  const sessionData = await session.get("__session");
  if (!sessionData) throw await logout(request);
  const token = await sessionData.token;
  if (!token) throw await logout(request);
  return { session, token };
}

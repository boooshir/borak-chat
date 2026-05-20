import { createCookieSessionStorage } from "react-router";
import { createThemeSessionResolver } from "remix-themes";

const isProduction = import.meta.env.NODE_ENV === "production";

const sessionStorage = createCookieSessionStorage({
  cookie: {
    name: "theme",
    path: "/",
    httpOnly: true,
    sameSite: "lax",
    secrets: [import.meta.env.VITE_SESSION_SECRET],
    ...(isProduction
      ? { domain: import.meta.env.VITE_DOMAIN, secure: true }
      : {}),
  },
});

export const themeSessionResolver = createThemeSessionResolver(sessionStorage);

interface JwtPayload {
  sub: number;
  publicId: string;
  username: string;
  email: string;
  exp?: number; // Expiration time (Unix timestamp in seconds)
  iat?: number; // Issued at
  [key: string]: any; // Allow custom claims
}

export function parseJwt(token: string): JwtPayload | null {
  try {
    const base64Url = token.split(".")[1];
    if (!base64Url) {
      throw new Error("Invalid JWT: Missing payload");
    }
    // Convert base64url to base64 (replace URL-safe characters)
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = atob(base64);
    const payload = JSON.parse(jsonPayload) as JwtPayload;
    return payload;
  } catch (err) {
    console.error("Failed to parse JWT:", err);
    return null;
  }
}

export function isJwtExpired(payload: JwtPayload | null): boolean {
  if (!payload || !payload.exp) {
    return true;
  }
  const currentTime = Math.floor(Date.now() / 1000);
  return payload.exp < currentTime;
}

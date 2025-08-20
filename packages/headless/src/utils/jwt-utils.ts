export interface JWTPayload {
  exp?: number;
  [key: string]: unknown;
}

/**
 * Parses a JWT token and returns its payload
 * @param token - The JWT token to parse
 * @returns The parsed JWT payload or null if invalid
 */
export function parseJWT(token?: string): JWTPayload | null {
  if (!token || !isJWTToken(token)) {
    return null;
  }

  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const base64decoded = atob(base64);

    const jsonPayload = decodeURIComponent(
      base64decoded
        .split('')
        .map((character) => {
          return `%${(`00${character.charCodeAt(0).toString(16)}`).slice(-2)}`;
        })
        .join('')
    );

    return JSON.parse(jsonPayload) as JWTPayload;
  } catch (_) {
    return null;
  }
}

/**
 * Checks if a JWT token should be renewed (expired or will expire soon)
 * @param token - The JWT token to check
 * @param bufferSeconds - Buffer time in seconds before expiration to consider token as needing renewal
 * @returns true if the token should be renewed (expired or expiring within buffer time), false otherwise
 */
export function shouldRenewJWT(
  token?: string,
  bufferSeconds: number = 60
): boolean {
  if (!token) {
    return false;
  }

  const parsedToken = parseJWT(token);

  if (!parsedToken || typeof parsedToken.exp !== 'number') {
    return false;
  }

  const nowSeconds = Math.floor(Date.now() / 1000);
  return parsedToken.exp <= nowSeconds + bufferSeconds;
}

/**
 * Checks if a token is a JWT format
 * @param token - The token to check
 * @returns true if the token matches JWT format, false otherwise
 */
function isJWTToken(token?: string): boolean {
  if (!token) {
    return false;
  }

  return /^[A-Za-z0-9_-]{2,}(?:\.[A-Za-z0-9_-]{2,}){2}$/.test(token);
}

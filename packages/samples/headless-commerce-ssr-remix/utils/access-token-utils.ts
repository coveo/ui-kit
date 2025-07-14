export function parseJwt(
  token?: string
): (Record<string, unknown> & {exp: number}) | null {
  if (!token || !isJwtToken(token)) {
    return null;
  }

  const splitToken = token.split('.');
  if (splitToken.length !== 3) {
    return null;
  }

  if (typeof window === 'undefined') {
    return JSON.parse(Buffer.from(splitToken[1], 'base64').toString());
  }

  const base64Url = splitToken[1];
  const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
  const jsonPayload = decodeURIComponent(
    window
      .atob(base64)
      .split('')
      .map((c) => `%${(`00${c.charCodeAt(0).toString(16)}`).slice(-2)}`)
      .join('')
  );

  return JSON.parse(jsonPayload);
}

export function isExpired(token?: string) {
  if (isApiKey(token)) {
    return false;
  }

  const parsedToken = parseJwt(token);

  return !parsedToken || parsedToken.exp < Math.floor(Date.now() / 1000);
}

function isApiKey(token?: string) {
  if (!token) {
    return false;
  }

  return /^xx[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-5][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$/.test(
    token
  );
}

function isJwtToken(token?: string) {
  if (!token) {
    return false;
  }

  return /^[A-Za-z0-9_-]{2,}(?:\.[A-Za-z0-9_-]{2,}){2}$/.test(token);
}

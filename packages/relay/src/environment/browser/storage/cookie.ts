export interface CookieManager {
  getItem: (key: string) => string | null;
  removeItem: (key: string) => void;
  setItem: (key: string, data: string, expire: number) => void;
}

export const cookieManager: CookieManager = createCookieManager();

function createCookieManager(): CookieManager {
  const prefix = "coveo_";
  const getDomain = (host: string) => {
    const parts = host.split(".").slice(-2);
    return parts.length == 2 ? parts.join(".") : "";
  };

  return {
    getItem(key: string): string | null {
      const cookiePrefix = `${prefix}${key}=`;
      const cookieArray = document.cookie.split(";");
      for (const cookie of cookieArray) {
        const prettifyCookie = cookie.replace(/^\s+/, "");
        if (prettifyCookie.lastIndexOf(cookiePrefix, 0) === 0) {
          return prettifyCookie.substring(
            cookiePrefix.length,
            prettifyCookie.length,
          );
        }
      }
      return null;
    },
    setItem(key: string, data: string, expire: number): void {
      const domain = getDomain(window.location.hostname);
      const expireSection = `;expires=${new Date(
        new Date().getTime() + expire,
      ).toUTCString()}`;
      const domainSection = domain ? `;domain=${domain}` : "";
      document.cookie = `${prefix}${key}=${data}${expireSection}${domainSection};path=/;SameSite=Lax`;
    },

    removeItem(key: string): void {
      this.setItem(key, "", -1);
    },
  };
}

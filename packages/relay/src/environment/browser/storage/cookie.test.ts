/**
 * @jest-environment jsdom
 * @jest-environment-options {"url": "http://docs.foo.bar.com/tamtam"}
 */

import { cookieManager } from "./cookie";

describe("CookieManager", () => {
  const key = "wow";
  const someData = "something";

  it("setItem writes data to a cookie", () => {
    cookieManager.setItem(key, someData, 1000);
    expect(cookieManager.getItem(key)).toBe(someData);
  });

  it("removeItem removes the cookie", () => {
    cookieManager.setItem(key, someData, 1000);
    cookieManager.removeItem(key);
    expect(cookieManager.getItem(key)).toBe(null);
  });

  it("honors expiration date", async () => {
    cookieManager.setItem(key, someData, 1000);
    await new Promise((res) => setTimeout(res, 1000)); // wait for 1 sec
    expect(cookieManager.getItem(key)).toBe(null);
  });

  it("sets the cookie with the last two parts of the domain", () => {
    expect(window.location.hostname).toBe("docs.foo.bar.com");
    Object.defineProperty(document, "cookie", {
      writable: true,
      value: "status=active",
    });

    cookieManager.setItem(key, someData, 10000);

    expect(document.cookie).toContain("domain=bar.com");
  });

  it("sets the cookie with the last two parts of the domain", () => {
    navigateTo("http://localhost:9002/acmeSite");
    expect(window.location.hostname).toBe("localhost");
    Object.defineProperty(document, "cookie", {
      writable: true,
      value: "status=active",
    });

    cookieManager.setItem(key, someData, 10000);

    expect(document.cookie).not.toContain("domain");
  });

  const navigateTo = (url: string): void => {
    // @ts-ignore
    delete window.location;
    // @ts-ignore
    window.location = new URL(url);
  };
});

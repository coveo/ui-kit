/**
 * @jest-environment jsdom
 * @jest-environment-options {"url": "http://localhost"}
 */

import { cookieManager } from "./cookie";

describe("CookieManager", () => {
  it("does not set a domain for localhost", () => {
    expect(window.location.hostname).toBe("localhost");
    Object.defineProperty(document, "cookie", {
      writable: true,
      value: "status=active",
    });

    cookieManager.setItem("key", "value", 10000);

    expect(document.cookie).not.toContain("domain");
  });
});

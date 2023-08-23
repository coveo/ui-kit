/**
 * @jest-environment jsdom
 */

import { currentEnvironment } from "../environment";
import { buildBrowserEnvironment } from "./browser";

it("currentEnvironment returns the browser runtime", () => {
  expect(currentEnvironment().runtime).toBe("browser");
});

describe("buildBrowserEnvironment", () => {
  Object.defineProperty(window.document, "referrer", {
    writable: true,
  });

  it("environment is browser", () => {
    expect(buildBrowserEnvironment().runtime).toBe("browser");
  });

  it("retrieves the referrerUrl", () => {
    Object.defineProperty(window.document, "referrer", {
      value: "https://www.coveo.com/",
    });
    expect(buildBrowserEnvironment().getReferrerUrl()).toBe(
      "https://www.coveo.com/"
    );
  });

  it("returns null when the referrerUrl is an empty string", () => {
    Object.defineProperty(window.document, "referrer", {
      value: "",
    });
    expect(buildBrowserEnvironment().getReferrerUrl()).toBe(null);
  });

  it("retrieves the url", () => {
    Object.defineProperty(window, "location", {
      value: {
        href: "https://www.patate.com/recettes",
      },
    });
    expect(buildBrowserEnvironment().getUrl()).toBe(
      "https://www.patate.com/recettes"
    );
  });

  it("retrieves the userAgent", () => {
    Object.defineProperty(navigator, "userAgent", {
      value: "bap",
    });
    expect(buildBrowserEnvironment().getUserAgent()).toBe("bap");
  });
});

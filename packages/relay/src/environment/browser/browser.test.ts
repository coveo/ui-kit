/**
 * @jest-environment jsdom
 */

import { buildBrowserEnvironment } from "./browser";

describe("buildBrowserEnvironment", () => {
  it("retrieves the referrer", () => {
    Object.defineProperty(window.document, "referrer", {
      value: "https://www.coveo.com/",
    });
    expect(buildBrowserEnvironment().getReferrer()).toBe(
      "https://www.coveo.com/"
    );
  });
});

/**
 * @jest-environment jsdom
 */

import { currentEnvironment } from "../environment";
import { buildBrowserEnvironment } from "./browser";

it("currentEnvironment returns the browser runtime", () => {
  expect(currentEnvironment().runtime).toBe("browser");
});

describe("buildBrowserEnvironment", () => {
  it("environment is browser", () => {
    expect(buildBrowserEnvironment().runtime).toBe("browser");
  });

  it("retrieves the referrer", () => {
    Object.defineProperty(window.document, "referrer", {
      value: "https://www.coveo.com/",
    });
    expect(buildBrowserEnvironment().getReferrer()).toBe(
      "https://www.coveo.com/"
    );
  });
});

/**
 * @jest-environment jsdom
 */

import { currentEnvironment } from "../environment";
import { buildBrowserEnvironment } from "./browser";

// Should be replace by a jest.spy once jest-environment-jsdom updates to jsdom 22
Object.defineProperty(window, "crypto", {
  value: {
    randomUUID: () => "2136b353-74be-42d7-904f-ea33a8f4a43c",
  },
});

it("currentEnvironment returns the browser runtime", () => {
  expect(currentEnvironment().runtime).toBe("browser");
});

describe("buildBrowserEnvironment", () => {
  Object.defineProperty(window.document, "referrer", {
    writable: true,
  });

  Object.defineProperty(navigator, "sendBeacon", {
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

  it("generates a UUID when calling generateUUID", () => {
    expect(buildBrowserEnvironment().generateUUID()).toBe(
      "2136b353-74be-42d7-904f-ea33a8f4a43c"
    );
  });

  it("calls the Fetch API when using fetch", async () => {
    const fetchSpy = jest.fn().mockImplementation(() => Promise.resolve());
    Object.defineProperty(globalThis, "fetch", {
      value: fetchSpy,
    });

    buildBrowserEnvironment().fetch("anything");

    expect(fetchSpy).toHaveBeenCalledTimes(1);
  });

  it("calls the Beacon API when using send", async () => {
    const beaconSpy = jest.fn(() => true);
    Object.defineProperty(navigator, "sendBeacon", {
      value: beaconSpy,
    });

    buildBrowserEnvironment().send("anything", "token", "bloup");

    expect(beaconSpy).toHaveBeenCalledTimes(1);
    expect(beaconSpy).toHaveBeenCalledWith(
      `anything?access_token=token`,
      new Blob(["bloup"], { type: "application/json" })
    );
  });

  it("returns null when calling send", async () => {
    Object.defineProperty(navigator, "sendBeacon", {
      value: jest.fn(() => true),
    });
    expect(await buildBrowserEnvironment().send("", "", "")).toBeNull();
  });

  it("throws an error if the sendBeacon's response is false", async () => {
    const beaconSpy = jest.fn(() => false);
    Object.defineProperty(navigator, "sendBeacon", {
      value: beaconSpy,
    });

    expect(buildBrowserEnvironment().send("", "", "")).rejects.toThrow(
      "Failed to send the event(s) because the payload size exceeded the maximum allowed size (32 KB). Please contact support if the problem persists."
    );
  });
});

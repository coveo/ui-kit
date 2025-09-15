/**
 * @vitest-environment-options {"url": "https://www.patate.com/recettes"}
 */

import { vi } from "vitest";
import { buildBrowserEnvironment } from "./browser.js";
import { createMockEvent } from "../../__mocks__/event.js";

vi.mock("uuid", () => ({
  v4: () => "2136b353-74be-42d7-904f-ea33a8f4a43c",
}));
const sendMessageSpy = vi.fn();
vi.mock("@coveo/explorer-messenger", () => ({
  createExplorerMessenger: () => ({ sendMessage: sendMessageSpy }),
}));

describe("buildBrowserEnvironment", () => {
  Object.defineProperty(window.document, "referrer", {
    writable: true,
  });

  Object.defineProperty(navigator, "sendBeacon", {
    writable: true,
  });

  beforeEach(() => {
    Object.defineProperty(navigator, "sendBeacon", {
      value: vi.fn(() => true),
    });
    sendMessageSpy.mockReset();
  });

  it("environment is browser", () => {
    expect(buildBrowserEnvironment().runtime).toBe("browser");
  });

  it("retrieves the referrer", () => {
    Object.defineProperty(window.document, "referrer", {
      value: "https://www.coveo.com/",
    });
    expect(buildBrowserEnvironment().getReferrer()).toBe(
      "https://www.coveo.com/",
    );
  });

  it("does not truncate the referrer to the 1024 character limit", () => {
    const limit = 1024;
    const referrer = "a".repeat(limit * 2);

    Object.defineProperty(window.document, "referrer", {
      value: referrer,
    });

    expect(buildBrowserEnvironment().getReferrer()).toHaveLength(
      referrer.length,
    );
  });

  it("returns null when the referrer is an empty string", () => {
    Object.defineProperty(window.document, "referrer", {
      value: "",
    });
    expect(buildBrowserEnvironment().getReferrer()).toBe(null);
  });

  it("retrieves the location", () => {
    expect(buildBrowserEnvironment().getLocation()).toBe(
      "https://www.patate.com/recettes",
    );
  });

  it("does not truncate the location to the 1024 character limit", () => {
    const limit = 1024;
    const location = "a".repeat(limit * 2);
    Object.defineProperty(window, "location", {
      value: {
        href: location,
      },
    });

    expect(buildBrowserEnvironment().getLocation()).toHaveLength(
      location.length,
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
      "2136b353-74be-42d7-904f-ea33a8f4a43c",
    );
  });

  it("calls the Beacon API when using send", () => {
    const beaconSpy = vi.fn(() => true);
    Object.defineProperty(navigator, "sendBeacon", {
      value: beaconSpy,
    });

    buildBrowserEnvironment().send("anything", "token", createMockEvent());

    expect(beaconSpy).toHaveBeenCalledTimes(1);
    expect(beaconSpy).toHaveBeenCalledWith(
      `anything?access_token=token`,
      new Blob(['{"bloup": "something"}'], { type: "application/json" }),
    );
  });

  it("returns undefined when calling send", () => {
    expect(
      buildBrowserEnvironment().send("", "", createMockEvent()),
    ).toBeUndefined();
  });

  it("throws an error if the sendBeacon's response is false", () => {
    Object.defineProperty(navigator, "sendBeacon", {
      value: vi.fn(() => false),
    });
    expect(() =>
      buildBrowserEnvironment().send("", "", createMockEvent()),
    ).toThrow(
      "Failed to send the event(s) because the payload size exceeded the maximum allowed size (32 KB). Please contact support if the problem persists.",
    );
  });

  it("calls sendMessage when calling send", () => {
    const event = createMockEvent();

    buildBrowserEnvironment().send("url", "token", event);
    expect(sendMessageSpy).toHaveBeenCalledTimes(1);
    expect(sendMessageSpy).toHaveBeenCalledWith({
      kind: "EVENT_PROTOCOL",
      url: "url",
      token: "token",
      event,
    });
  });
});

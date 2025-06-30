/**
 * @jest-environment jsdom
 */

import { buildBrowserEnvironment } from "./browser";
import { createMockEvent } from "../../__mocks__/event";

jest.mock("uuid", () => ({
  v4: () => "2136b353-74be-42d7-904f-ea33a8f4a43c",
}));
const sendMessageSpy = jest.fn();
jest.mock("@coveo/explorer-messenger", () => ({
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
      value: jest.fn(() => true),
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

  it("truncates the referrer beyond 1024 characters", () => {
    const limit = 1024;
    const referrer = "a".repeat(limit + 1);

    Object.defineProperty(window.document, "referrer", {
      value: referrer,
    });

    expect(buildBrowserEnvironment().getReferrer()).toHaveLength(limit);
  });

  it("returns null when the referrer is an empty string", () => {
    Object.defineProperty(window.document, "referrer", {
      value: "",
    });
    expect(buildBrowserEnvironment().getReferrer()).toBe(null);
  });

  it("retrieves the location", () => {
    Object.defineProperty(window, "location", {
      value: {
        href: "https://www.patate.com/recettes",
      },
    });
    expect(buildBrowserEnvironment().getLocation()).toBe(
      "https://www.patate.com/recettes",
    );
  });

  it("truncates the location beyond 1024 characters", () => {
    const limit = 1024;
    const location = "a".repeat(limit + 1);

    Object.defineProperty(window, "location", {
      value: { href: location },
    });

    expect(buildBrowserEnvironment().getLocation()).toHaveLength(limit);
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
    const beaconSpy = jest.fn(() => true);
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
      value: jest.fn(() => false),
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

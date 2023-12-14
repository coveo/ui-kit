/**
 * @jest-environment jsdom
 */

import messenger from "@coveo/explorer-messenger";
import { buildBrowserEnvironment } from "./browser";
import { createMockEvent } from "../../__mocks__/event";

// Should be replace by a jest.spy once jest-environment-jsdom updates to jsdom 22
Object.defineProperty(window, "crypto", {
  value: {
    randomUUID: () => "2136b353-74be-42d7-904f-ea33a8f4a43c",
  },
});

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
  });

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

  it("calls the Beacon API when using send", async () => {
    const beaconSpy = jest.fn(() => true);
    Object.defineProperty(navigator, "sendBeacon", {
      value: beaconSpy,
    });

    buildBrowserEnvironment().send("anything", "token", createMockEvent());

    expect(beaconSpy).toHaveBeenCalledTimes(1);
    expect(beaconSpy).toHaveBeenCalledWith(
      `anything?access_token=token`,
      new Blob(['{"bloup": "something"}'], { type: "application/json" })
    );
  });

  it("returns undefined when calling send", async () => {
    expect(
      await buildBrowserEnvironment().send("", "", createMockEvent())
    ).toBeUndefined();
  });

  it("throws an error if the sendBeacon's response is false", () => {
    Object.defineProperty(navigator, "sendBeacon", {
      value: jest.fn(() => false),
    });
    expect(
      buildBrowserEnvironment().send("", "", createMockEvent())
    ).rejects.toThrow(
      "Failed to send the event(s) because the payload size exceeded the maximum allowed size (32 KB). Please contact support if the problem persists."
    );
  });

  it("calls sendMessage when calling send", () => {
    const sendMessageSpy = jest.fn();
    jest
      .spyOn(messenger, "createExplorerMessenger")
      .mockImplementationOnce(() => ({ sendMessage: sendMessageSpy }));
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

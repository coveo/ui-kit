import { vi } from "vitest";
import { validate } from "uuid";
import { buildBrowserEnvironment } from "./browser.js";
import { createMockEvent } from "../../__mocks__/event.js";
import { clientIdKey } from "../../constants.js";
import { createBrowserStorage } from "./storage/storage.js";

const sendMessageSpy = vi.fn();
vi.mock("@coveo/explorer-messenger", () => ({
  createExplorerMessenger: () => ({ sendMessage: sendMessageSpy }),
}));

beforeEach(() => {
  sendMessageSpy.mockReset();
});

describe("buildBrowserEnvironment", () => {
  beforeAll(() => {
    Object.defineProperty(window.document, "referrer", {
      writable: true,
    });
  });

  beforeEach(() => {
    sendMessageSpy.mockReset();
    window.location.hostname = "";
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
    Object.defineProperty(window, "location", {
      value: { href: "https://www.patate.com/recettes" },
    });

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

  describe("getClientId", () => {
    it("given no existing UUID, it generates a UUID when calling getClientId", () => {
      const storage = createBrowserStorage();

      expect(storage.getItem(clientIdKey)).toBe(null);
      expect(validate(buildBrowserEnvironment().getClientId())).toBe(true);
    });

    it("returns an existing UUID when one is available in storage", () => {
      const storage = createBrowserStorage();
      storage.setItem(clientIdKey, "e4b8c63a-0000-4dfe-9b13-000000000001");
      expect(buildBrowserEnvironment().getClientId()).toBe(
        "e4b8c63a-0000-4dfe-9b13-000000000001",
      );
    });

    it("generates a new UUID when the id in storage is not a valid UUID", () => {
      const storage = createBrowserStorage();
      storage.setItem(clientIdKey, "invalid-id");
      expect(validate(buildBrowserEnvironment().getClientId())).toBe(true);
    });
  });

  it("calls the Fetch API with keepAlive when using send", async () => {
    const fetchSpy = vi.spyOn(window, "fetch");
    const event = createMockEvent();
    await buildBrowserEnvironment().send(
      "https://www.coveo.com/",
      "token",
      event,
    );

    expect(fetchSpy).toHaveBeenCalledTimes(1);
    expect(fetchSpy).toHaveBeenCalledWith(
      "https://www.coveo.com/",
      expect.objectContaining({
        keepalive: true,
        body: JSON.stringify([event]),
        headers: expect.objectContaining({
          Authorization: "Bearer token",
        }),
      }),
    );
  });

  it("returns undefined when calling send", async () => {
    expect(
      await buildBrowserEnvironment().send(
        "https://www.coveo.com/",
        "",
        createMockEvent(),
      ),
    ).toBeUndefined();
  });

  it("calls sendMessage when calling send", async () => {
    const event = createMockEvent();

    await buildBrowserEnvironment().send(
      "https://www.coveo.com/",
      "token",
      event,
    );
    expect(sendMessageSpy).toHaveBeenCalledTimes(1);
    expect(sendMessageSpy).toHaveBeenCalledWith({
      kind: "EVENT_PROTOCOL",
      url: "https://www.coveo.com/",
      token: "token",
      event,
    });
  });
});

import { vi } from "vitest";
import { createMockConfig } from "./__mocks__/config.js";
import { createRelay } from "./relay.js";

vi.mock("uuid", () => ({
  v4: () => "da3248bd-48f3-4dbf-b898-6fee32069b53",
}));

describe("relay", () => {
  const relay = createRelay({
    token: "",
    trackingId: "",
    url: "",
    mode: "disabled",
  });

  it("when emitting a payload strongly-typed as an object string keys, tsc does not error", () => {
    interface Event {
      a: string;
    }

    const payload: Event = { a: "" };
    relay.emit("event", payload);
    expect(true).toBe(true);
  });

  it("version holds the expected placeholder", () => {
    expect(relay.version).toBe("process.env.VERSION");
  });

  it("updates the clientId to an empty string when disconnecting to its environment on disabled mode", () => {
    const relay = createRelay(createMockConfig());

    expect(relay.getMeta("type").clientId).toEqual(
      "da3248bd-48f3-4dbf-b898-6fee32069b53",
    );
    relay.updateConfig({ mode: "disabled" });

    expect(relay.getMeta("type").clientId).toEqual("");
  });
});

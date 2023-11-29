import { createMockConfig } from "./__mocks__/config";
import { createRelay } from "./relay";

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
    const mockedUUID = "1234-1234-1234-1234-1234";
    jest.spyOn(crypto, "randomUUID").mockReturnValueOnce(mockedUUID);
    const relay = createRelay(createMockConfig());

    expect(relay.getMeta("type").clientId).toEqual(mockedUUID);
    relay.updateConfig({ mode: "disabled" });

    expect(relay.getMeta("type").clientId).toEqual("");
  });
});

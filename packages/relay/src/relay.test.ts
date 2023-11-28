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
});

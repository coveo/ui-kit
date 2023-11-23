import { createMockEvent } from "../../__mocks__/event";
import { buildNullEnvironment } from "./null";

describe("null environment", () => {
  it("returns the correct runtime", () => {
    expect(buildNullEnvironment().runtime).toBe("null");
  });

  it("returns null referrer", () => {
    expect(buildNullEnvironment().getReferrer()).toBeNull();
  });

  it("returns null location", () => {
    expect(buildNullEnvironment().getLocation()).toBeNull();
  });

  it("returns null userAgent", () => {
    expect(buildNullEnvironment().getUserAgent()).toBeNull();
  });

  it("returns empty UUID", () => {
    expect(buildNullEnvironment().generateUUID()).toBe("");
  });

  it("does not call fetch ", async () => {
    globalThis.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve([
            {
              valid: true,
            },
          ]),
      } as Response)
    );

    const response = await buildNullEnvironment().fetch("anything");
    expect(response.ok).toBeTruthy();
    const data = await response.json();
    expect(data).toEqual("");

    expect(fetch).not.toBeCalled();
  });

  it("returns undefined send", async () => {
    expect(
      await buildNullEnvironment().send("bap", "", createMockEvent())
    ).toBeUndefined();
  });
});

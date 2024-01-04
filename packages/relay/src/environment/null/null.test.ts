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

  it("returns undefined send", () => {
    expect(
      buildNullEnvironment().send("bap", "", createMockEvent())
    ).toBeUndefined();
  });
});

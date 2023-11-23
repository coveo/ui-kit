import { createMockEvent } from "../../__mocks__/event";
import { currentEnvironment } from "../environment";
import { buildNodeEnvironment } from "./node";

jest
  .spyOn(crypto, "randomUUID")
  .mockImplementation(() => "2136b353-74be-42d7-904f-ea33a8f4a43c");

it("currentEnvironment returns node runtime", () => {
  expect(currentEnvironment().runtime).toBe("node");
});

describe("buildNodeEnvironment", () => {
  it("runtime is node", () => {
    expect(buildNodeEnvironment().runtime).toBe("node");
  });

  it("getReferrer returns null", () => {
    expect(buildNodeEnvironment().getReferrer()).toBe(null);
  });

  it("getLocation returns null", () => {
    expect(buildNodeEnvironment().getLocation()).toBe(null);
  });

  it("getUserAgent returns null", () => {
    expect(buildNodeEnvironment().getUserAgent()).toBe(null);
  });

  it("generateUUID returns an UUID", () => {
    expect(buildNodeEnvironment().generateUUID()).toBe(
      "2136b353-74be-42d7-904f-ea33a8f4a43c"
    );
  });

  it("calls the Fetch API when using fetch", async () => {
    const fetchSpy = jest.fn().mockImplementation(() => Promise.resolve());
    Object.defineProperty(globalThis, "fetch", {
      value: fetchSpy,
    });

    buildNodeEnvironment().fetch("anything");

    expect(fetchSpy).toHaveBeenCalledTimes(1);
  });

  it("calls the Fetch API when using send", async () => {
    const fetchSpy = jest.fn().mockImplementation(() => Promise.resolve());
    Object.defineProperty(globalThis, "fetch", {
      value: fetchSpy,
    });
    const expectedHeaders = {
      "Content-Type": "application/json",
      Authorization: `Bearer token`,
    };

    const event = createMockEvent();
    buildNodeEnvironment().send("anything", "token", event);

    expect(fetchSpy).toHaveBeenCalledTimes(1);
    expect(fetchSpy).toHaveBeenCalledWith(`anything`, {
      method: "POST",
      body: JSON.stringify([event]),
      headers: expectedHeaders,
    });
  });

  it("returns null when calling send", async () => {
    expect(
      await buildNodeEnvironment().send("", "", createMockEvent())
    ).toBeUndefined();
  });
});

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

  it("getReferrerUrl returns null", () => {
    expect(buildNodeEnvironment().getReferrerUrl()).toBe(null);
  });

  it("getUrl returns null", () => {
    expect(buildNodeEnvironment().getUrl()).toBe(null);
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

    buildNodeEnvironment().send("anything", "token", "bloup");

    expect(fetchSpy).toHaveBeenCalledTimes(1);
    expect(fetchSpy).toHaveBeenCalledWith(`anything`, {
      method: "POST",
      body: "bloup",
      headers: expectedHeaders,
    });
  });

  it("returns null when calling send", async () => {
    expect(await buildNodeEnvironment().send("", "", "")).toBeNull();
  });
});

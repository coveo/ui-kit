import { currentEnvironment } from "../environment";
import { buildNodeEnvironment } from "./node";

jest.mock("uuid", () => ({
  v4: () => "2136b353-74be-42d7-904f-ea33a8f4a43c",
}));

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
});

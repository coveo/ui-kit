import { currentEnvironment } from "../environment";
import { buildNodeEnvironment } from "./node";

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
});

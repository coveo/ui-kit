import { currentEnvironment } from "../environment";
import { buildNodeEnvironment } from "./node";

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
});

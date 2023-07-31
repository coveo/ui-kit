import { buildNodeEnvironment } from "./node";

describe("buildNodeEnvironment", () => {
  it("getReferrer returns null", () => {
    expect(buildNodeEnvironment().getReferrer()).toBe(null);
  });
});

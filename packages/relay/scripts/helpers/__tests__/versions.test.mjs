/**
 * @todo LENS-1126: should transpile functions from .mjs files with Jest
 */

import { versionCompare } from "../versions.mjs";

describe("versionCompare", () => {
  it("returns 1 if version1 major is greater than version2", () => {
    const version1 = "2.0.0";
    const version2 = "1.3.3";

    expect(versionCompare(version1, version2)).toBe(1);
  });

  it("returns -1 if version1 major is smaller than version2", () => {
    const version1 = "1.3.3";
    const version2 = "2.0.0";

    expect(versionCompare(version1, version2)).toBe(-1);
  });

  it("returns 1 if version1 minor is greater than version2", () => {
    const version1 = "2.2.3";
    const version2 = "2.1.4";

    expect(versionCompare(version1, version2)).toBe(1);
  });

  it("returns -1 if version1 minor is smaller than version2", () => {
    const version1 = "2.1.4";
    const version2 = "2.2.3";

    expect(versionCompare(version1, version2)).toBe(-1);
  });

  it("returns 1 if version1 patch is greater than version2", () => {
    const version1 = "2.2.5";
    const version2 = "2.2.4";

    expect(versionCompare(version1, version2)).toBe(1);
  });

  it("returns -1 if version1 patch is smaller than version2", () => {
    const version1 = "2.2.4";
    const version2 = "2.2.5";

    expect(versionCompare(version1, version2)).toBe(-1);
  });

  it("returns 0 if version1 and version2 are equal", () => {
    const version1 = "2.2.4";
    const version2 = "2.2.4";

    expect(versionCompare(version1, version2)).toBe(0);
  });
});

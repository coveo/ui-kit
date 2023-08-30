import { createMockEnvironment } from "../../__mocks__/environment";
import { createMockOptions } from "../../__mocks__/relay";
import { createMeta } from "./meta";

jest.mock("../../version", () => ({
  version: "0.0.5",
}));

describe("createMeta", () => {
  const mockEnv = createMockEnvironment({
    runtime: "browser",
    fetch: jest.fn(),
    getReferrerUrl: () => "https://www.perdu.com",
    getUrl: () => "https://www.perdu.com/whoops",
    getUserAgent: () => "I am userAgent",
  });
  const defaultOptions = createMockOptions();
  const defaultMeta = createMeta("itemView", defaultOptions, mockEnv);

  it("returns meta with the clientId field", () => {
    expect(defaultMeta.clientId).toBe("2136b353-74be-42d7-904f-ea33a8f4a43c");
  });

  it("returns meta with the referrerUrl field", () => {
    expect(defaultMeta.referrerUrl).toBe("https://www.perdu.com");
  });

  it("returns meta with the url field if a url is defined in the environment", () => {
    expect(defaultMeta.url).toBe("https://www.perdu.com/whoops");
  });

  it("returns meta with the ts field, being the current timestamp", () => {
    jest.useFakeTimers().setSystemTime(new Date("2023-08-15T00:00:00.000Z"));

    const specfiedtimeMeta = createMeta("itemView", defaultOptions, mockEnv);
    expect(specfiedtimeMeta.ts).toBe(1692057600000);
  });

  it("returns meta with the source field, base on the current version of relay", () => {
    expect(defaultMeta.source).toBe("relay@0.0.5");
  });

  it("returns meta with the userAgent field if a userAgent is defined in the environment", () => {
    expect(defaultMeta.userAgent).toBe("I am userAgent");
  });

  it("returns meta with the type set as a parameter", () => {
    expect(defaultMeta.type).toBe("itemView");
  });

  it("returns meta with the config set as parameter", () => {
    expect(defaultMeta.config).toEqual({ trackingId: "website" });
  });
});

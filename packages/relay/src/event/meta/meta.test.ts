import { createMockClientIdManager } from "../../__mocks__/client-id";
import { createMockEnvironment } from "../../__mocks__/environment";
import { createMockConfig } from "../../__mocks__/config";
import { createMeta } from "./meta";

describe("createMeta", () => {
  const mockEnv = createMockEnvironment({
    runtime: "browser",
    getReferrer: () => "https://www.perdu.com",
    getLocation: () => "https://www.perdu.com/whoops",
    getUserAgent: () => "I am userAgent",
  });
  const defaultConfig = createMockConfig();
  const defaultClientIdManager = createMockClientIdManager();
  const defaultMeta = createMeta(
    "itemView",
    defaultConfig,
    mockEnv,
    defaultClientIdManager
  );

  it("returns meta with the clientId field", () => {
    expect(defaultMeta.clientId).toBe("2136b353-74be-42d7-904f-ea33a8f4a43c");
  });

  it("returns meta with the referrer field", () => {
    expect(defaultMeta.referrer).toBe("https://www.perdu.com");
  });

  it("returns meta with the location field if a location is defined in the environment", () => {
    expect(defaultMeta.location).toBe("https://www.perdu.com/whoops");
  });

  it("returns meta with the ts field, being the current timestamp", () => {
    jest.useFakeTimers().setSystemTime(new Date("2023-08-15T00:00:00.000Z"));

    const specfiedtimeMeta = createMeta(
      "itemView",
      defaultConfig,
      mockEnv,
      defaultClientIdManager
    );
    expect(specfiedtimeMeta.ts).toBe(1692057600000);
  });

  it("returns meta with a concatenated version if additional sources were set", () => {
    const sourcedMeta = createMeta(
      "itemView",
      createMockConfig({ source: ["atomic@1.2", "headless@3.4"] }),
      mockEnv,
      defaultClientIdManager
    );
    expect(sourcedMeta.source).toEqual([
      "atomic@1.2",
      "headless@3.4",
      "relay@process.env.VERSION",
    ]);
  });

  it("returns meta with the source field with a version placeholder", () => {
    expect(defaultMeta.source).toEqual(["relay@process.env.VERSION"]);
  });

  it("returns meta with the userAgent field if a userAgent is defined in the environment", () => {
    expect(defaultMeta.userAgent).toBe("I am userAgent");
  });

  it("returns meta with the type set as a parameter", () => {
    expect(defaultMeta.type).toBe("itemView");
  });

  it("returns meta with the config set as parameter", () => {
    expect(defaultMeta.config).toEqual({
      trackingId: "website",
    });
  });
});

import { vi } from "vitest";
import { createMockEnvironment } from "../../__mocks__/environment.js";
import { createMockConfig } from "../../__mocks__/config.js";
import { createMeta } from "./meta.js";
import type { Environment } from "../../relay.js";

describe("createMeta", () => {
  let mockEnv: Environment;
  const defaultConfig = createMockConfig();

  beforeEach(() => {
    mockEnv = createMockEnvironment({
      runtime: "browser",
      getReferrer: () => "https://www.perdu.com",
      getLocation: () => "https://www.perdu.com/whoops",
      getUserAgent: () => "I am userAgent",
      getClientId: () => "2136b353-74be-42d7-904f-ea33a8f4a43c",
    });
  });

  function getItemViewMeta() {
    return createMeta("itemView", defaultConfig, mockEnv);
  }

  it("returns meta with the clientId field", () => {
    expect(getItemViewMeta().clientId).toBe(
      "2136b353-74be-42d7-904f-ea33a8f4a43c",
    );
  });

  it("returns meta with the referrer field", () => {
    expect(getItemViewMeta().referrer).toBe("https://www.perdu.com");
  });

  it("truncates the referrer beyond 1024 characters", () => {
    const limit = 1024;
    const referrer = "a".repeat(limit + 1);
    mockEnv.getReferrer = () => referrer;

    expect(getItemViewMeta().referrer).toHaveLength(limit);
  });

  it("returns a null referrer when the referrer is null", () => {
    mockEnv.getReferrer = () => null;
    expect(getItemViewMeta().referrer).toBe(null);
  });

  it("returns meta with the location field if a location is defined in the environment", () => {
    expect(getItemViewMeta().location).toBe("https://www.perdu.com/whoops");
  });

  it("truncates the location beyond 1024 characters", () => {
    const limit = 1024;
    const location = "a".repeat(limit + 1);
    mockEnv.getLocation = () => location;

    expect(getItemViewMeta().location).toHaveLength(limit);
  });

  it("returns a null location when the location is null", () => {
    mockEnv.getLocation = () => null;
    expect(getItemViewMeta().location).toBe(null);
  });

  it("returns meta with the ts field, being the current timestamp", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2023-08-15T00:00:00.000Z"));

    const specfiedtimeMeta = createMeta("itemView", defaultConfig, mockEnv);
    expect(specfiedtimeMeta.ts).toBe(1692057600000);
  });

  it("returns meta with a concatenated version if additional sources were set", () => {
    const sourcedMeta = createMeta(
      "itemView",
      createMockConfig({ source: ["atomic@1.2", "headless@3.4"] }),
      mockEnv,
    );
    expect(sourcedMeta.source).toEqual([
      "atomic@1.2",
      "headless@3.4",
      "relay@process.env.VERSION",
    ]);
  });

  it("returns meta with the source field with a version placeholder", () => {
    expect(getItemViewMeta().source).toEqual(["relay@process.env.VERSION"]);
  });

  it("returns meta with the userAgent field if a userAgent is defined in the environment", () => {
    expect(getItemViewMeta().userAgent).toBe("I am userAgent");
  });

  it("returns meta with the type set as a parameter", () => {
    expect(getItemViewMeta().type).toBe("itemView");
  });

  it("returns meta with the config set as parameter", () => {
    expect(getItemViewMeta().config).toEqual({
      trackingId: "website",
    });
  });
});

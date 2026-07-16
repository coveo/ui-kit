import { createMockConfig } from "../__mocks__/config.js";
import { createConfigManager, type RelayConfig } from "./config.js";

describe("createConfigManager", () => {
  const initialConfig: RelayConfig = createMockConfig({
    trackingId: "initial",
    url: "url",
    token: "nope",
  });

  describe("get", () => {
    it("returns an immutable config object", () => {
      const { get } = createConfigManager(initialConfig);

      expect(get()).toEqual(initialConfig);
      initialConfig.url = "bap";
      expect(get().url).not.toEqual(initialConfig.url);
    });

    it("will omit the properties that are not from config interface from the initialConfig", () => {
      const wildConfig = { ...initialConfig, patate: 1 };
      const { get } = createConfigManager(wildConfig);

      expect(get()).not.toEqual(wildConfig);
      expect(get()).toEqual(initialConfig);
    });

    it("returns the config with optional parameters if set", () => {
      const configWithOptionalParams = createMockConfig({
        ...initialConfig,
        mode: "disabled",
      });
      const { get } = createConfigManager(configWithOptionalParams);

      expect(get()).toEqual(configWithOptionalParams);
    });
  });

  describe("update", () => {
    it("persists unchanged config after an update was made", () => {
      const { get, update } = createConfigManager(initialConfig);
      update({ url: "something else" });

      expect(get().trackingId).toEqual(initialConfig.trackingId);
    });

    it("updates the specified config", () => {
      const { get, update } = createConfigManager(initialConfig);

      expect(get().trackingId).toEqual(initialConfig.trackingId);

      update({ trackingId: "updated" });
      expect(get().trackingId).not.toEqual(initialConfig.trackingId);
      expect(get().trackingId).toEqual("updated");
    });

    it("will not include the properties that are not part of RelayConfig to the updated config", () => {
      const { get, update } = createConfigManager(initialConfig);
      update({ url: "something else", patate: 1 } as unknown as RelayConfig);

      const config = get();

      expect("patate" in config).toBe(false);
      expect(config.url).toBe("something else");
    });
  });
});

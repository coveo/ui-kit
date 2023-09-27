import { createMockConfig } from "../__mocks__/config";
import { createConfigManager, RelayConfig } from "./config";

describe("createConfigManager", () => {
  const initialConfig = createMockConfig({
    trackingId: "initial",
    host: "some hosts",
    organizationId: "hello",
    token: "nope",
  });

  describe("get", () => {
    it("returns an immutable config object", () => {
      const { get } = createConfigManager(initialConfig);

      expect(get()).toEqual(initialConfig);
      initialConfig.host = "bap";
      expect(get().host).not.toEqual(initialConfig.host);
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
        mode: "validate",
      });
      const { get } = createConfigManager(configWithOptionalParams);

      expect(get()).toEqual(configWithOptionalParams);
    });
  });

  describe("update", () => {
    it("persists unchanged config after an update was made", () => {
      const { get, update } = createConfigManager(initialConfig);
      update({ host: "something else" });

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
      update({ host: "something else", patate: 1 } as unknown as RelayConfig);

      expect(get()).not.toEqual({
        ...initialConfig,
        host: "something else",
        patate: 1,
      });

      expect(get()).toEqual({
        ...initialConfig,
        host: "something else",
      });
    });
  });
});

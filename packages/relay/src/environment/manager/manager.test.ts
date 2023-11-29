import {
  createMockConfig,
  createMockConfigManager,
} from "../../__mocks__/config";
import { createEnvironmentManager } from "./manager";

describe("createEnvironmentManager", () => {
  describe("get", () => {
    it("gets a null environment if the config mode is disabled", () => {
      const configManager = createMockConfigManager({
        get: () => createMockConfig({ mode: "disabled" }),
      });
      const environmentManager = createEnvironmentManager(configManager);

      expect(environmentManager.get().runtime).toBe("null");
    });

    it("gets the current environment if the config mode is not disabled", () => {
      const configManager = createMockConfigManager({
        get: () => createMockConfig({ mode: "emit" }),
      });
      const environmentManager = createEnvironmentManager(configManager);

      expect(environmentManager.get().runtime).toBe("node");
    });
  });
});

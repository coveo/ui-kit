import {
  createMockConfig,
  createMockConfigManager,
} from "../../__mocks__/config.js";
import { createEnvironmentManager } from "./manager.js";

describe("createEnvironmentManager - browser", () => {
  describe("get", () => {
    it("gets the browser environment when running in the browser", () => {
      const configManager = createMockConfigManager();
      const environmentManager = createEnvironmentManager(configManager);

      expect(environmentManager.get().runtime).toBe("browser");
    });

    it("gets a null environment if the config mode is disabled", () => {
      const configManager = createMockConfigManager({
        get: () => createMockConfig({ mode: "disabled" }),
      });
      const environmentManager = createEnvironmentManager(configManager);

      expect(environmentManager.get().runtime).toBe("null");
    });

    it("gets a null environment if localStorage is not available", () => {
      const configManager = createMockConfigManager();
      const environmentManager = createEnvironmentManager(configManager);

      Object.defineProperty(window, "localStorage", {
        value: undefined,
        writable: true,
      });

      expect(environmentManager.get().runtime).toBe("null");
    });
  });
});

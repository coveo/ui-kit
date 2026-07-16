import {
  createMockConfig,
  createMockConfigManager,
} from "../../__mocks__/config.js";
import { createMockEnvironment } from "../../__mocks__/environment.js";
import { createEnvironmentManager } from "./manager.js";

describe("createEnvironmentManager - custom", () => {
  describe("get", () => {
    it("gets the custom environment when configured", () => {
      const configManager = createMockConfigManager({
        get: () =>
          createMockConfig({
            environment: createMockEnvironment(),
          }),
      });
      const environmentManager = createEnvironmentManager(configManager);

      expect(environmentManager.get().runtime).toBe("custom");
    });

    it("gets a null environment instead of custom if the config mode is disabled", () => {
      const configManager = createMockConfigManager({
        get: () =>
          createMockConfig({
            environment: createMockEnvironment(),
            mode: "disabled",
          }),
      });
      const environmentManager = createEnvironmentManager(configManager);

      expect(environmentManager.get().runtime).toBe("null");
    });
  });
});

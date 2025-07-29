import { createMockConfigManager } from "../../__mocks__/config.js";
import { createEnvironmentManager } from "./manager.js";

describe("createEnvironmentManager - node", () => {
  describe("get", () => {
    it("gets the null environment in nodejs", () => {
      const configManager = createMockConfigManager();
      const environmentManager = createEnvironmentManager(configManager);

      expect(environmentManager.get().runtime).toBe("null");
    });
  });
});

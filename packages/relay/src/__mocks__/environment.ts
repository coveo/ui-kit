import { vi } from "vitest";
import type { Environment } from "../environment/environment.js";
import type { EnvironmentManager } from "../environment/manager/manager.js";
import { createMockStorage } from "./storage.js";

const mockEnvironment: Environment = {
  runtime: "null",
  send: vi.fn(),
  getReferrer: vi.fn(),
  getLocation: vi.fn(),
  getUserAgent: vi.fn(),
  generateUUID: vi.fn(),
  storage: createMockStorage(),
};

export function createMockEnvironment(
  environment: Partial<Environment> = {},
): Environment {
  return { ...mockEnvironment, ...environment };
}

export function createMockEnvironmentManager(
  manager: Partial<EnvironmentManager> = {},
): EnvironmentManager {
  return {
    get: () => createMockEnvironment(),
    ...manager,
  };
}

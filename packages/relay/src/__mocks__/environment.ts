import { Environment } from "../environment/environment.js";
import { EnvironmentManager } from "../environment/manager/manager.js";
import { createMockStorage } from "./storage.js";

const defaultEnvironment: Environment = {
  runtime: "null",
  send: jest.fn(),
  getReferrer: jest.fn(),
  getLocation: jest.fn(),
  getUserAgent: jest.fn(),
  generateUUID: jest.fn(),
  storage: createMockStorage(),
};

export function createMockEnvironment(
  environment?: Partial<Environment>,
): Environment {
  return {
    ...defaultEnvironment,
    ...environment,
  };
}

export function createMockEnvironmentManager(
  environmentManager?: Partial<EnvironmentManager>,
): EnvironmentManager {
  return {
    get: () => createMockEnvironment(),
    ...environmentManager,
  };
}

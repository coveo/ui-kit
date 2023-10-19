import { Environment } from "../environment/environment";
import { createMockStorage } from "./storage";

const defaultEnvironment: Environment = {
  runtime: "node",
  fetch: jest.fn(() =>
    Promise.resolve({
      ok: true,
      json: () => Promise.resolve([{ valid: true }]),
    } as Response)
  ),
  send: jest.fn(),
  getReferrerUrl: jest.fn(),
  getUrl: jest.fn(),
  getUserAgent: jest.fn(),
  generateUUID: jest.fn(),
  storage: createMockStorage(),
};

export function createMockEnvironment(
  environment?: Partial<Environment>
): Environment {
  return {
    ...defaultEnvironment,
    ...environment,
  };
}

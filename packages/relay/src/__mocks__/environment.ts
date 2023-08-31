import { Environment } from "../environment/environment";

const defaultEnvironment: Environment = {
  runtime: "node",
  fetch: jest.fn(() =>
    Promise.resolve({
      ok: true,
      json: () => Promise.resolve([{ valid: true }]),
    } as Response)
  ),
  getReferrerUrl: jest.fn(),
  getUrl: jest.fn(),
  getUserAgent: jest.fn(),
  generateUUID: jest.fn(),
};

export function createMockEnvironment(
  environment?: Partial<Environment>
): Environment {
  return {
    ...defaultEnvironment,
    ...environment,
  };
}

import { Environment } from "../environment";

export function buildNodeEnvironment(): Environment {
  return {
    getReferrer: () => null,
  };
}

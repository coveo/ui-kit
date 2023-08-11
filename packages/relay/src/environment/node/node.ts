import { Environment } from "../environment";

export function buildNodeEnvironment(): Environment {
  return {
    runtime: "node",
    getReferrer: () => null,
  };
}

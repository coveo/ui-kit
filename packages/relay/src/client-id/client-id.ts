import { Environment } from "../environment/environment";

export interface ClientIdManager {
  clientId: string;
}

/**
 * @todo LENS-1059: The clientId should be a value that is persisted over time on a device.
 */
function getClientId(environment: Environment): string {
  return environment.generateUUID();
}

export function createClientIdManager(
  environment: Environment
): ClientIdManager {
  return {
    clientId: getClientId(environment),
  };
}

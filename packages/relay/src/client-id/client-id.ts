import { validate } from "uuid";
import { Environment } from "../environment/environment";

export interface ClientIdManager {
  clientId: string;
}

function getClientId(environment: Environment): string {
  const storage = environment.storage;
  const key = "visitorId";

  const existingClientId = storage.getItem(key);
  const clientId =
    existingClientId && validate(existingClientId)
      ? existingClientId
      : environment.generateUUID();
  storage.setItem(key, clientId);
  return clientId;
}

export function createClientIdManager(
  environment: Environment
): ClientIdManager {
  return {
    clientId: getClientId(environment),
  };
}

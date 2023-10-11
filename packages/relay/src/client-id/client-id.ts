import { validate } from "uuid";
import { Environment } from "../environment/environment";

export interface ClientIdManager {
  getClientId: () => string;
  clear: () => void;
}

export function createClientIdManager(
  environment: Environment
): ClientIdManager {
  const key = "visitorId";
  return {
    getClientId: () => {
      const storage = environment.storage;

      const existingClientId = storage.getItem(key);
      const clientId =
        existingClientId && validate(existingClientId)
          ? existingClientId
          : environment.generateUUID();
      storage.setItem(key, clientId);
      return clientId;
    },
    clear: () => {
      environment.storage.removeItem(key);
    },
  };
}

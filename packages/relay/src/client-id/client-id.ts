import { validate } from "uuid";
import { EnvironmentManager } from "../environment/manager/manager.js";
import { clientIdKey } from "../constants.js";

export interface ClientIdManager {
  getClientId: () => string;
}

export function createClientIdManager(
  environmentManager: EnvironmentManager,
): ClientIdManager {
  return {
    getClientId: () => {
      const environment = environmentManager.get();
      const storage = environment.storage;

      const existingClientId = storage.getItem(clientIdKey);
      const clientId =
        existingClientId && validate(existingClientId)
          ? existingClientId
          : environment.generateUUID();
      storage.setItem(clientIdKey, clientId);
      return clientId;
    },
  };
}

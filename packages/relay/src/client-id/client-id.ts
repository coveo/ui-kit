import { validate } from "uuid";
import { EnvironmentManager } from "../environment/manager/manager";

export interface ClientIdManager {
  getClientId: () => string;
}

export function createClientIdManager(
  environmentManager: EnvironmentManager,
): ClientIdManager {
  return {
    getClientId: () => {
      const key = "visitorId";
      const environment = environmentManager.get();
      const storage = environment.storage;

      const existingClientId = storage.getItem(key);
      const clientId =
        existingClientId && validate(existingClientId)
          ? existingClientId
          : environment.generateUUID();
      storage.setItem(key, clientId);
      return clientId;
    },
  };
}

import { validate } from "uuid";
import { EnvironmentManager } from "../environment/manager/manager";

export interface ClientIdManager {
  getClientId: () => string;
  clear: () => void;
}

export function createClientIdManager(
  environmentManager: EnvironmentManager
): ClientIdManager {
  const key = "visitorId";

  return {
    getClientId: () => {
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
    clear: () => {
      environmentManager.get().storage.removeItem(key);
    },
  };
}

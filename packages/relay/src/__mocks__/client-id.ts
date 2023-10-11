import { ClientIdManager } from "../client-id/client-id";

export function createMockClientIdManager(
  clientIdManager?: Partial<ClientIdManager>
): ClientIdManager {
  return {
    getClientId: () => "2136b353-74be-42d7-904f-ea33a8f4a43c",
    clear: () => {},
    ...clientIdManager,
  };
}

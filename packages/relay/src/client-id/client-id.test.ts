import {
  createMockEnvironment,
  createMockEnvironmentManager,
} from "../__mocks__/environment.js";
import { createMockStorage } from "../__mocks__/storage.js";
import { createClientIdManager } from "./client-id.js";

describe("createClientIdManager", () => {
  it("generates a clientId if storage does not contain one", () => {
    const environmentManagerWithoutStorage = createMockEnvironmentManager({
      get: () =>
        createMockEnvironment({
          generateUUID: () => "UUID-generated",
          storage: createMockStorage(),
        }),
    });

    const clientIdManager = createClientIdManager(
      environmentManagerWithoutStorage,
    );

    expect(clientIdManager.getClientId()).toBe("UUID-generated");
  });

  it("returns a clientId from storage if it already exists", () => {
    const uuidStored = "2136b353-74be-42d7-904f-ea33a8f4a43c";
    const storage = createMockStorage({
      getItem: () => uuidStored,
    });
    const environmentManagerWithStorage = createMockEnvironmentManager({
      get: () =>
        createMockEnvironment({
          generateUUID: () => "UUID-generated",
          storage,
        }),
    });

    const clientIdManager = createClientIdManager(
      environmentManagerWithStorage,
    );
    expect(clientIdManager.getClientId()).toBe(uuidStored);
  });

  it("generates a clientId if the one in storage is corrupted", () => {
    const storage = createMockStorage({
      getItem: () => "corrupted_uuid_stored",
    });
    const environmentManagerWithStorage = createMockEnvironmentManager({
      get: () =>
        createMockEnvironment({
          generateUUID: () => "UUID-generated",
          storage,
        }),
    });

    const clientIdManager = createClientIdManager(
      environmentManagerWithStorage,
    );
    expect(clientIdManager.getClientId()).toBe("UUID-generated");
  });
});

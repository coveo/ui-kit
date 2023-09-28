import { createMockEnvironment } from "../__mocks__/environment";
import { createMockStorage } from "../__mocks__/storage";
import { createClientIdManager } from "./client-id";

describe("createClientIdManager", () => {
  it("generates a clientId if storage does not contain one", () => {
    const environmentWithoutStorage = createMockEnvironment({
      generateUUID: () => "UUID-generated",
      storage: createMockStorage(),
    });

    const clientIdManager = createClientIdManager(environmentWithoutStorage);

    expect(clientIdManager.clientId).toBe("UUID-generated");
  });
  it("returns a clientId from storage if it already exists", () => {
    const uuidStored = "2136b353-74be-42d7-904f-ea33a8f4a43c";
    const storage = createMockStorage({
      getItem: () => uuidStored,
    });
    const environmentWithStorage = createMockEnvironment({
      generateUUID: () => "UUID-generated",
      storage,
    });

    const clientIdManager = createClientIdManager(environmentWithStorage);
    expect(clientIdManager.clientId).toBe(uuidStored);
  });

  it("generates a clientId if the one in storage is corrupted", () => {
    const storage = createMockStorage({
      getItem: () => "corrupted_uuid_stored",
    });
    const environmentWithStorage = createMockEnvironment({
      generateUUID: () => "UUID-generated",
      storage,
    });

    const clientIdManager = createClientIdManager(environmentWithStorage);
    expect(clientIdManager.clientId).toBe("UUID-generated");
  });
});

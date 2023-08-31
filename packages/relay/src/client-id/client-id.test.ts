import { createMockEnvironment } from "../__mocks__/environment";
import { createClientIdManager } from "./client-id";

describe("createClientIdManager", () => {
  const defaultEnvironment = createMockEnvironment({
    generateUUID: () => "2136b353-74be-42d7-904f-ea33a8f4a43c",
  });

  const defaultClientIdManager = createClientIdManager(defaultEnvironment);

  it("returns a clientId", () => {
    expect(defaultClientIdManager.clientId).toBe(
      "2136b353-74be-42d7-904f-ea33a8f4a43c"
    );
  });
});

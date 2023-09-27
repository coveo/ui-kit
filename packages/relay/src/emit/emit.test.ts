import { createMockEnvironment } from "../__mocks__/environment";
import { createMockEvent } from "../__mocks__/event";
import { createMockConfig } from "../__mocks__/config";
import { emit } from "./emit";

describe("emit", () => {
  const config = createMockConfig();
  const event = createMockEvent();

  it("send an events and returns void", async () => {
    const environmentWithSuccessfulFetch = createMockEnvironment({
      fetch: jest.fn(() =>
        Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              events: [
                {
                  valid: false,
                  errorCode: "514",
                  errorMessage: "detour",
                },
              ],
            }),
        } as Response)
      ),
    });
    const response = await emit({
      config,
      event,
      environment: environmentWithSuccessfulFetch,
    });

    expect(response).toBe(undefined);
  });
});

import { createMockEnvironment } from "../__mocks__/environment";
import { createMockEvent } from "../__mocks__/event";
import { createMockOptions } from "../__mocks__/relay";
import { emit } from "./emit";

describe("emit", () => {
  const options = createMockOptions();
  const event = createMockEvent();
  const environment = createMockEnvironment();
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
      options,
      event,
      environment: environmentWithSuccessfulFetch,
    });

    expect(response).toBe(undefined);
  });
});

import { createMockEnvironment } from "../__mocks__/environment";
import { createMockEvent } from "../__mocks__/event";
import { createMockOptions } from "../__mocks__/relay";
import { callEventApi } from "./event-api-caller";

describe("callEventApi", () => {
  const options = createMockOptions();
  const event = createMockEvent();
  const environment = createMockEnvironment();
  const validate = true;

  it("sets expected url and body for the fetch function", async () => {
    const { host, organizationId } = options;
    await callEventApi({ event, options, environment, validate });

    const expectedEvent = [createMockEvent()];
    const expectedHeaders = {
      "Content-Type": "application/json",
      Authorization: `Bearer I am token`,
    };
    const expectedUrl = `${host}/rest/organizations/${organizationId}/events/v1/validate`;
    expect(environment.fetch).toHaveBeenCalledWith(expectedUrl, {
      body: JSON.stringify(expectedEvent),
      headers: expectedHeaders,
      method: "POST",
    });
  });

  it("throws the service error if one is returned", async () => {
    const rejectedEnvironment = createMockEnvironment({
      fetch: jest.fn(() =>
        Promise.resolve({
          ok: false,
          json: () =>
            Promise.resolve({
              errorCode: "invalid_token",
              message: "This is invalid!",
              requestID: "request ID",
            }),
        } as Response)
      ),
    });

    expect(() =>
      callEventApi({ options, event, environment: rejectedEnvironment })
    ).rejects.toThrow();
  });
});

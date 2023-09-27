import { createMockEnvironment } from "../__mocks__/environment";
import { createMockEvent } from "../__mocks__/event";
import { createMockConfig } from "../__mocks__/config";
import { callEventApi } from "./event-api-caller";

describe("callEventApi", () => {
  const config = createMockConfig({ mode: "validate" });
  const event = createMockEvent();
  const environment = createMockEnvironment();

  it("sets expected url and body for the fetch function for validate mode", async () => {
    const configWithValidateMode = createMockConfig({
      mode: "validate",
    });
    const { host, organizationId } = configWithValidateMode;

    await callEventApi({
      event,
      config: configWithValidateMode,
      environment,
    });

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

  it("sets expected url and body for the fetch function for emit mode", async () => {
    const configWithEmitMode = createMockConfig({ mode: "emit" });
    const { host, organizationId } = configWithEmitMode;
    
    await callEventApi({ event, config: configWithEmitMode, environment });

    const expectedEvent = [createMockEvent()];
    const expectedHeaders = {
      "Content-Type": "application/json",
      Authorization: `Bearer I am token`,
    };
    const expectedUrl = `${host}/rest/organizations/${organizationId}/events/v1`;
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
      callEventApi({ config, event, environment: rejectedEnvironment })
    ).rejects.toThrow();
  });
});

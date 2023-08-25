import { createMockEnvironment } from "../__mocks__/environment";
import { createMockEvent } from "../__mocks__/event";
import { createMockOptions } from "../__mocks__/relay";
import { ServiceErrorResponse, validate, ValidationResponse } from "./validate";

describe("validate", () => {
  const options = createMockOptions();
  const event = createMockEvent();
  const environment = createMockEnvironment();

  it("sets expected url and body for the fetch function", async () => {
    const fetchSpy = jest.spyOn(environment, "fetch");
    await validate({ options, event, environment });

    const expectedUrl =
      "https://platform.cloud.coveo.com/rest/organizations/my-org/events/v1/validate";
    const expectedEvent = [
      {
        name: "I am name",
        searchUID: "I am Id",
        meta: {
          type: "itemClick",
          config: {
            trackingId: "website",
          },
          ts: 1692057600000,
          source: "relay@0.0.5",
          clientId: "2136b353-74be-42d7-904f-ea33a8f4a43c",
          userAgent: null,
          referrerUrl: null,
          url: null,
        },
      },
    ];
    const expectedHeaders = {
      "Content-Type": "application/json",
      Authorization: `Bearer I am token`,
    };

    expect(fetchSpy).toHaveBeenCalledWith(expectedUrl, {
      body: JSON.stringify(expectedEvent),
      headers: expectedHeaders,
      method: "POST",
    });
  });

  it("returns the first event of the validation response if it's invalid", async () => {
    const environmentWithSuccessfulFetch = createMockEnvironment({
      fetch: jest.fn(() =>
        Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve([
              {
                valid: false,
                errors: [{ type: "whoops", message: "uh oh", path: ".$" }],
              },
            ]),
        } as Response)
      ),
    });
    const response = (await validate({
      options,
      event,
      environment: environmentWithSuccessfulFetch,
    })) as Readonly<ValidationResponse>;

    expect(response).toEqual({
      valid: false,
      errors: [{ type: "whoops", message: "uh oh", path: ".$" }],
      responseType: "validation",
    });
  });

  it("returns the first event of the validation response if it's valid", async () => {
    const environmentWithSuccessfulFetch = createMockEnvironment({
      fetch: jest.fn(() =>
        Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve([
              {
                valid: true,
              },
            ]),
        } as Response)
      ),
    });
    const response = (await validate({
      options,
      event,
      environment: environmentWithSuccessfulFetch,
    })) as Readonly<ValidationResponse>;

    expect(response).toEqual({
      valid: true,
      errors: [],
      responseType: "validation",
    });
  });

  it("returns the service error response if one is returned", async () => {
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
    const response = (await validate({
      options,
      event,
      environment: rejectedEnvironment,
    })) as Readonly<ServiceErrorResponse>;

    expect(response).toEqual({
      valid: false,
      responseType: "serviceError",
      errorCode: "invalid_token",
      message: "This is invalid!",
      requestID: "request ID",
    });
  });
});

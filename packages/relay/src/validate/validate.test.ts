import { createMockEnvironment } from "../__mocks__/environment";
import { createMockEvent } from "../__mocks__/event";
import { createMockConfig } from "../__mocks__/config";
import { validate, ValidationResponse } from "./validate";

describe("validate", () => {
  const config = createMockConfig({ mode: "validate" });
  const event = createMockEvent();
  const environment = createMockEnvironment();

  it("sets expected url and body for the fetch function", async () => {
    await validate({
      event,
      config,
      environment,
    });

    const expectedEvent = [createMockEvent()];
    const expectedHeaders = {
      "Content-Type": "application/json",
      Authorization: `Bearer I am token`,
    };
    const expectedUrl = `${config.url}/validate`;
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

    expect(
      validate({ config, event, environment: rejectedEnvironment })
    ).rejects.toThrow();
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
      config,
      event,
      environment: environmentWithSuccessfulFetch,
    })) as Readonly<ValidationResponse>;

    expect(response).toEqual({
      valid: false,
      errors: [{ type: "whoops", message: "uh oh", path: ".$" }],
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
      config,
      event,
      environment: environmentWithSuccessfulFetch,
    })) as Readonly<ValidationResponse>;

    expect(response).toEqual({
      valid: true,
      errors: [],
    });
  });

  it("returns disabled as error message if no data is returned", async () => {
    const environmentWithSuccessfulFetch = createMockEnvironment({
      fetch: jest.fn(() => Promise.resolve(new Response(JSON.stringify("")))),
    });
    const response = await validate({
      config,
      event,
      environment: environmentWithSuccessfulFetch,
    });

    expect(response).toEqual({
      valid: false,
      errors: [{ type: "", message: "disabled", path: "" }],
    });
  });
});

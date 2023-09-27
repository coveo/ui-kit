import { createMockEnvironment } from "../__mocks__/environment";
import { createMockEvent } from "../__mocks__/event";
import { createMockConfig } from "../__mocks__/config";
import { validate, ValidationResponse } from "./validate";

describe("validate", () => {
  const config = createMockConfig();
  const event = createMockEvent();

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
      config,
      event,
      environment: environmentWithSuccessfulFetch,
    })) as Readonly<ValidationResponse>;

    expect(response).toEqual({
      valid: true,
      errors: [],
      responseType: "validation",
    });
  });
});

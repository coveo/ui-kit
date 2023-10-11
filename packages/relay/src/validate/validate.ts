import {
  callEventApi,
  EventApiCallParams,
} from "../event-api-call/event-api-caller";

export interface ValidationError {
  type: string;
  message: string;
  path: string;
}

export interface ValidationResponse {
  valid: boolean;
  errors: ValidationError[];
}

export async function validate(
  params: EventApiCallParams
): Promise<Readonly<ValidationResponse>> {
  const data = await callEventApi<ValidationResponse[] | "">(params);

  if (!data) {
    return {
      valid: false,
      errors: [{ type: "", message: "disabled", path: "" }],
    };
  }

  const { valid, errors } = data[0];

  return { valid, errors: errors ?? [] };
}

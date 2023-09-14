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
  responseType: "validation";
  errors: ValidationError[];
}

export async function validate(
  params: EventApiCallParams
): Promise<Readonly<ValidationResponse>> {
  params.validate = true;
  const data = await callEventApi(params);

  const { valid, errors } = data[0];

  return { valid, errors: errors ?? [], responseType: "validation" };
}

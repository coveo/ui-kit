import { Environment } from "../environment/environment";
import { RelayOptions } from "../relay";
import { RelayEvent } from "../event/relay-event";

interface ValidationParams {
  event: Readonly<RelayEvent>;
  options: RelayOptions;
  environment: Environment;
}

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

export interface ServiceErrorResponse {
  valid: false;
  responseType: "serviceError";
  errorCode: string;
  message: string;
  requestID: string;
}

export type ValidationReport = ValidationResponse | ServiceErrorResponse;

export async function validate({
  event,
  options,
  environment,
}: ValidationParams): Promise<Readonly<ValidationReport>> {
  const { host, token, organizationId } = options;

  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
  const url = `${host}/rest/organizations/${organizationId}/events/v1/validate`;

  const response = await environment.fetch(url, {
    method: "POST",
    body: JSON.stringify([event]),
    headers,
  });

  const data = await response.json();

  if (!response.ok) {
    return {
      valid: false,
      responseType: "serviceError",
      ...data,
    };
  }

  const { valid, errors } = data[0];

  return { valid, errors: errors ?? [], responseType: "validation" };
}

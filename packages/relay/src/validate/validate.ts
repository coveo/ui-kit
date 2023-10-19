import { Environment } from "../environment/environment";
import { RelayEvent } from "../event/relay-event";
import { RelayConfig } from "../relay";

export interface ValidateParams {
  config: RelayConfig;
  environment: Environment;
  event: Readonly<RelayEvent>;
}

export interface ValidationError {
  type: string;
  message: string;
  path: string;
}

export interface ValidationResponse {
  valid: boolean;
  errors: ValidationError[];
}

export async function validate({
  config,
  environment,
  event,
}: ValidateParams): Promise<Readonly<ValidationResponse>> {
  const { url, token } = config;
  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };

  const response = await environment.fetch(`${url}/validate`, {
    method: "POST",
    body: JSON.stringify([event]),
    headers,
  });
  const data = await response.json();

  if (!response.ok) {
    throw new Error({
      ...data,
    });
  }

  if (!data) {
    return {
      valid: false,
      errors: [{ type: "", message: "disabled", path: "" }],
    };
  }

  const { valid, errors } = data[0];

  return { valid, errors: errors ?? [] };
}

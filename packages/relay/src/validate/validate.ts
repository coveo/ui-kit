import { Environment } from "../environment/environment";
import { RelayEvent } from "../event/relay-event";
import { RelayConfig } from "../relay";

export interface ValidateParams {
  config: RelayConfig;
  environment: Environment;
  event: Readonly<RelayEvent>;
}

/**
 * The `ValidationError` object represents a syntax error identified in an event's property during the validation process.
 */
export interface ValidationError {
  /**
   * Type of syntax error of an event's property.
   */
  type: string;

  /**
   * Message describing the syntax error of an event's property.
   */
  message: string;

  /**
   * Path of the property with a syntax error in the event's payload.
   */
  path: string;
}

/**
 * The `ValidationResponse` object represents the results of an event validation process. It indicates whether the event's payload is valid and provides a list of any syntax errors that were found.
 */
export interface ValidationResponse {
  /**
   * Indicates whether the payload is valid.
   */
  valid: boolean;

  /**
   * List of syntax errors found in the emitted event(s).
   * Each syntax error for a given property in a given event will be represented as a single ValidationError object.
   */
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

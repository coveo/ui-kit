import { currentEnvironment } from "./environment/environment";
import { createRelayEvent } from "./event/relay-event";
import {
  ServiceErrorResponse,
  validate,
  ValidationError,
  ValidationReport,
  ValidationResponse,
} from "./validate/validate";
import { version } from "./version";

type RelayPayload = Record<string, unknown>;

interface RelayOptions {
  host: string;
  organizationId: string;
  token: string;
  trackingId: string;
}

interface Relay {
  validate: (type: string, payload: RelayPayload) => Promise<ValidationReport>;
  version: string;
}

export function createRelay(options: RelayOptions): Relay {
  const environment = currentEnvironment();
  return {
    validate: (type: string, payload: RelayPayload) =>
      validate({
        options,
        environment,
        event: createRelayEvent(type, payload, options, environment),
      }),
    version,
  };
}

export type {
  RelayPayload,
  RelayOptions,
  ServiceErrorResponse,
  ValidationError,
  ValidationReport,
  ValidationResponse,
};

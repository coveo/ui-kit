import { emit } from "./emit/emit";
import { createClientIdManager } from "./client-id/client-id";
import { currentEnvironment } from "./environment/environment";
import { createRelayEvent } from "./event/relay-event";
import {
  validate,
  ValidationError,
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
  validate: (
    type: string,
    payload: RelayPayload
  ) => Promise<ValidationResponse>;
  emit: (type: string, payload: RelayPayload) => Promise<void>;
  version: string;
}

export function createRelay(options: RelayOptions): Relay {
  const environment = currentEnvironment();
  const clientIdManager = createClientIdManager(environment);

  return {
    validate: (type: string, payload: RelayPayload) =>
      validate({
        options,
        environment,
        event: createRelayEvent(
          type,
          payload,
          options,
          environment,
          clientIdManager
        ),
      }),
    emit: (type: string, payload: RelayPayload) =>
      emit({
        options,
        environment,
        event: createRelayEvent(
          type,
          payload,
          options,
          environment,
          clientIdManager
        ),
      }),
    version,
  };
}

export type { RelayPayload, RelayOptions, ValidationError, ValidationResponse };

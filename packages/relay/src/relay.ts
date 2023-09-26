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
import { RelayMode } from "./event-api-call/event-api-caller";
import { createMeta, Meta } from "./event/meta/meta";
import { createListenerManager, EventCallback } from "./listener/listener";

type RelayPayload = Record<string, unknown>;
type Off = () => void;

interface RelayOptions {
  host: string;
  organizationId: string;
  token: string;
  trackingId: string;
  mode?: RelayMode;
}

interface Relay {
  validate: (
    type: string,
    payload: RelayPayload
  ) => Promise<ValidationResponse>;
  emit: (type: string, payload: RelayPayload) => Promise<void>;
  getMeta: (type: string) => Meta;
  on: (type: string, callback: EventCallback) => Off;
  off: (type: string, callback?: EventCallback) => void;
  version: string;
}

export function createRelay(options: RelayOptions): Relay {
  const environment = currentEnvironment();
  const clientIdManager = createClientIdManager(environment);
  const { add, call, remove } = createListenerManager();

  return {
    validate: (type: string, payload: RelayPayload) => {
      const event = createRelayEvent(
        type,
        payload,
        options,
        environment,
        clientIdManager
      );

      call(event);

      return validate({
        options,
        environment,
        event: createRelayEvent(
          type,
          payload,
          options,
          environment,
          clientIdManager
        ),
      });
    },
    emit: (type: string, payload: RelayPayload) => {
      const event = createRelayEvent(
        type,
        payload,
        options,
        environment,
        clientIdManager
      );

      call(event);

      return emit({
        options,
        environment,
        event,
      });
    },
    getMeta: (type: string) =>
      createMeta(type, options, environment, clientIdManager),
    on: (type: string, callback: EventCallback) => add({ type, callback }),
    off: (type: string, callback?: EventCallback) => remove(type, callback),
    version,
  };
}

export type { RelayPayload, RelayOptions, ValidationError, ValidationResponse };

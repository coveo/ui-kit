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
import { createMeta, Meta } from "./event/meta/meta";
import { createListenerManager, EventCallback } from "./listener/listener";
import { createConfigManager, RelayConfig } from "./config/config";

type RelayPayload = Record<string, unknown>;
type Off = () => void;

interface Relay {
  validate: (
    type: string,
    payload: RelayPayload
  ) => Promise<ValidationResponse>;
  emit: (type: string, payload: RelayPayload) => Promise<void>;
  getMeta: (type: string) => Meta;
  on: (type: string, callback: EventCallback) => Off;
  off: (type: string, callback?: EventCallback) => void;
  updateConfig: (config: Partial<RelayConfig>) => void;
  version: string;
}

export function createRelay(initialConfig: RelayConfig): Relay {
  const environment = currentEnvironment();
  const clientIdManager = createClientIdManager(environment);
  const configManager = createConfigManager(initialConfig);
  const { add, call, remove } = createListenerManager();

  return {
    validate: (type: string, payload: RelayPayload) => {
      const event = createRelayEvent(
        type,
        payload,
        configManager.get(),
        environment,
        clientIdManager
      );

      call(event);

      return validate({
        config: configManager.get(),
        environment,
        event,
      });
    },
    emit: (type: string, payload: RelayPayload) => {
      const event = createRelayEvent(
        type,
        payload,
        configManager.get(),
        environment,
        clientIdManager
      );

      call(event);

      return emit({
        config: configManager.get(),
        environment,
        event,
      });
    },
    getMeta: (type: string) =>
      createMeta(type, configManager.get(), environment, clientIdManager),
    on: (type: string, callback: EventCallback) => add({ type, callback }),
    off: (type: string, callback?: EventCallback) => remove(type, callback),
    updateConfig: (config: Partial<RelayConfig>) =>
      configManager.update(config),
    version,
  };
}

export type { RelayPayload, RelayConfig, ValidationError, ValidationResponse };

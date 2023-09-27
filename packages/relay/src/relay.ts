import { emit } from "./emit/emit";
import { createClientIdManager } from "./client-id/client-id";
import { currentEnvironment } from "./environment/environment";
import { createRelayEvent } from "./event/relay-event";
import { version } from "./version";
import { createMeta, Meta } from "./event/meta/meta";
import { createListenerManager, EventCallback } from "./listener/listener";
import { createConfigManager, RelayConfig } from "./config/config";
import {
  validate,
  ValidationError,
  ValidationResponse,
} from "./validate/validate";

type RelayPayload = Record<string, unknown>;
type Off = () => void;

interface Relay {
  emit: (
    type: string,
    payload: RelayPayload
  ) => Promise<void | ValidationResponse>;
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
    emit: (type: string, payload: RelayPayload) => {
      const event = createRelayEvent(
        type,
        payload,
        configManager.get(),
        environment,
        clientIdManager
      );

      call(event);

      const params = { config: configManager.get(), environment, event };

      return configManager.get().mode === "validate" ? validate(params) : emit(params);
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

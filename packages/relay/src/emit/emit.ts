import {Environment} from '../environment/environment.js';
import {ListenerManager} from '../listener/listener.js';
import {RelayEvent} from '../event/relay-event.js';
import {RelayConfig} from '../relay.js';

export interface EmitParams {
  config: RelayConfig;
  environment: Environment;
  event: RelayEvent;
  listenerManager: ListenerManager;
}

export async function emit({
  config,
  environment,
  event,
  listenerManager,
}: EmitParams): Promise<void> {
  const {url, token, mode} = config;
  const isEnabled = mode !== 'disabled';

  if (isEnabled) {
    listenerManager.call(event);
    return environment.send(url, token, event);
  }
}

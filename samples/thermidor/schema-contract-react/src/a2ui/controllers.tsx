import {useCallback, useMemo, useSyncExternalStore} from 'react';
import {
  buildRemoteController,
  type RemoteController,
  type RemoteControllerActionDispatcher,
  type RemoteControllerSource,
} from '@coveo/thermidor';

export type ControllerAdvertisement = {
  controllerId: string;
  controllerSchema: string;
};

type ControllerState = Record<string, unknown>;

export type EngineStateSource = RemoteControllerSource;

export function useAdvertisedController<T extends ControllerState>(
  source: EngineStateSource,
  advertisement: ControllerAdvertisement,
  dispatchAction: RemoteControllerActionDispatcher
): [RemoteController<T>, T] {
  const controller = useMemo(
    () =>
      buildRemoteController<T>({
        source,
        controllerId: advertisement.controllerId,
        dispatchAction,
      }),
    [advertisement.controllerId, dispatchAction, source]
  );
  const subscribe = useCallback(
    (listener: () => void) => controller.subscribe(() => listener()),
    [controller]
  );
  const getSnapshot = useCallback(() => controller.state, [controller]);

  return [controller, useSyncExternalStore(subscribe, getSnapshot, getSnapshot)];
}

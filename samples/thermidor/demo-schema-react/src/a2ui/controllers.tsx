import {useCallback, useMemo, useSyncExternalStore} from 'react';
import {
  buildRemoteController,
  type ComponentType,
  type RemoteController,
  type RemoteControllerSource,
} from '@coveo/thermidor';

export type EngineStateSource = RemoteControllerSource;

export function useRemoteController<TComponentType extends ComponentType>(
  source: RemoteControllerSource,
  componentId: string,
  componentType: TComponentType
): RemoteController<TComponentType> {
  const controller = useMemo(
    () => buildRemoteController({source, componentId, componentType}),
    [componentId, componentType, source]
  );

  const subscribe = useCallback(
    (onStoreChange: () => void) => controller.subscribe(() => onStoreChange()),
    [controller]
  );
  const getSnapshot = useCallback(() => controller.state, [controller]);

  useSyncExternalStore(subscribe, getSnapshot, getSnapshot);

  return controller;
}

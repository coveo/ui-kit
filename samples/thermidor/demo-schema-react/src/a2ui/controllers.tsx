import {useCallback, useMemo, useSyncExternalStore} from 'react';
import {
  buildRemoteController,
  type AdvertisedRemoteController,
  type RemoteControllerSource,
} from '@coveo/thermidor';
import type {ControllerContracts} from '@coveo/thermidor-schema';

type ControllerSchemaId = ControllerContracts['controllerSchema'];

export type ControllerAdvertisement<TSchema extends ControllerSchemaId = ControllerSchemaId> = {
  controllerId: string;
  controllerSchema: TSchema;
};

export type EngineStateSource = RemoteControllerSource;

type AdvertisedController<TSchema extends ControllerSchemaId> = AdvertisedRemoteController<TSchema>;

export function useAdvertisedController<TSchema extends ControllerSchemaId>(
  source: EngineStateSource,
  {controllerId, controllerSchema: contract}: ControllerAdvertisement<TSchema>
): AdvertisedController<TSchema> {
  const controller = useMemo(
    () => buildRemoteController({source, controllerId, contract}),
    [controllerId, contract, source]
  );

  const subscribe = useCallback(
    (onStoreChange: () => void) => controller.subscribe(() => onStoreChange()),
    [controller]
  );
  const getSnapshot = useCallback(() => controller.state, [controller]);

  // Force re-render when the remote controller's state changes
  useSyncExternalStore(subscribe, getSnapshot, getSnapshot);

  return controller;
}

import {useMemo} from 'react';
import {
  buildRemoteController,
  type AdvertisedRemoteController,
  type RemoteControllerSource,
} from '@coveo/thermidor';
import type {ControllerContracts} from '@coveo/thermidor-contracts';

type ControllerSchemaId = ControllerContracts['schemaId'];

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
  return useMemo(
    () => buildRemoteController({source, controllerId, contract}),
    [controllerId, contract, source]
  );
}

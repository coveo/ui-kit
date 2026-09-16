import {useCallback, useMemo, useSyncExternalStore} from 'react';
import type {ComponentContractsSchema} from '@coveo/thermidor-schema';
import type {ComponentTypeOf, RemoteController} from '@coveo/thermidor';
import {useSession} from '../context/session.js';

type Contracts = typeof ComponentContractsSchema;

/**
 * Obtains a schema-validated {@link RemoteController} for a component from the
 * active session and keeps it subscribed through `useSyncExternalStore`. The
 * controller binds to the active turn's AG-UI state snapshot and re-points as
 * the session's active turn changes.
 */
export function useRemoteController<TComponentType extends ComponentTypeOf<Contracts>>(
  componentId: string,
  componentType: TComponentType
): RemoteController<Contracts, TComponentType> {
  const session = useSession();

  const controller = useMemo(
    () => session.remoteController(componentId, componentType),
    [session, componentId, componentType]
  );

  const subscribe = useCallback(
    (onStoreChange: () => void) => controller.subscribe(() => onStoreChange()),
    [controller]
  );
  const getSnapshot = useCallback(() => controller.state, [controller]);

  useSyncExternalStore(subscribe, getSnapshot, getSnapshot);

  return controller;
}

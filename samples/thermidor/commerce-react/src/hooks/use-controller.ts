import {useSyncExternalStore} from 'react';
import type {Controller} from '@coveo/thermidor';

export function useController<T>(controller: Controller<T>): T {
  return useSyncExternalStore(
    (onStoreChange) => controller.subscribe(onStoreChange),
    () => controller.state,
    () => controller.state
  );
}

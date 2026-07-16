import {useSyncExternalStore} from 'react';
import type {Controller} from '@coveo/thermidor';

export function useController<T>(controller: Controller<T>): T {
  return useSyncExternalStore(
    controller.subscribe,
    () => controller.state,
    () => controller.state
  );
}

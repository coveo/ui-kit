import type {Controller} from '@coveo/headless';
import {useEffect, useState} from 'react';

/**
 * Subscribes a React component to a Headless controller and returns its latest
 * state. This is the single bridge between Headless controllers and React: every
 * component in this sample reads its data through this hook.
 */
export function useController<TController extends Controller>(
  controller: TController
): TController['state'] {
  const [state, setState] = useState(controller.state);

  useEffect(() => controller.subscribe(() => setState(controller.state)), [controller]);

  return state as TController['state'];
}

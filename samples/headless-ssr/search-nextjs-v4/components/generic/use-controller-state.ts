'use client';

import type {Unsubscribe} from '@coveo/headless/ssr-next';
import {useEffect, useState} from 'react';

interface Subscribable<TState> {
  state: TState;
  subscribe(listener: () => void): Unsubscribe;
}

/**
 * Returns the state of a controller: its static state until the page is hydrated, then the state of the
 * live controller.
 */
export function useControllerState<TState>(staticState: TState, controller?: Subscribable<TState>) {
  const [state, setState] = useState(staticState);

  useEffect(() => controller?.subscribe(() => setState({...controller.state})), [controller]);

  return state;
}

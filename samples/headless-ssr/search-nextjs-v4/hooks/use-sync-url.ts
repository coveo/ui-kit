'use client';

import {buildSSRSearchParameterSerializer, type SearchParameters} from '@coveo/headless/ssr-next';
import {useEffect, useReducer} from 'react';

const {serialize, toSearchParameters} = buildSSRSearchParameterSerializer();

interface UseSyncUrlProps {
  parameters: SearchParameters;
  /**
   * The parameter manager controller, `undefined` until the static state is hydrated.
   */
  parameterManager?: {synchronize(parameters: SearchParameters): void};
}

/**
 * Keeps the URL and the search parameters in sync: the back and forward buttons update the search
 * parameters, and a new query or a selected facet value adds a history entry.
 *
 * The URL is read when the effects run, not during render: during a client-side navigation, the render
 * still sees the URL of the previous page.
 */
export function useSyncUrl({parameters, parameterManager}: UseSyncUrlProps) {
  const [historyChanges, onHistoryChange] = useReducer((count: number) => count + 1, 0);

  useEffect(() => {
    window.addEventListener('popstate', onHistoryChange);
    return () => window.removeEventListener('popstate', onHistoryChange);
  }, []);

  useEffect(() => {
    parameterManager?.synchronize(toSearchParameters(new URL(window.location.href).searchParams));
  }, [historyChanges, parameterManager]);

  // Before hydration, the URL is only corrected in place, so loading a page adds no history entry.
  useEffect(() => {
    const url = serialize(parameters, new URL(window.location.href));
    if (url !== window.location.href) {
      window.history[parameterManager ? 'pushState' : 'replaceState'](null, document.title, url);
    }
  }, [parameters]);
}

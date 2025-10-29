'use client';

import {
  buildSSRSearchParameterSerializer,
  type SearchParameterManager,
  type SearchParameterManagerState,
} from '@coveo/headless/ssr';
import {useEffect, useMemo, useState} from 'react';
import {useAppHistoryRouter} from '../../components/common/history-router';

interface UseSyncSearchParameterManagerProps {
  staticState: SearchParameterManagerState;
  controller?: SearchParameterManager;
}

function useSearchParameterManager({
  staticState,
  controller,
}: UseSyncSearchParameterManagerProps) {
  const [searchParameters, setSearchParameters] = useState(staticState);
  useEffect(() => {
    if (!controller) {
      return;
    }
    return controller.subscribe(() => setSearchParameters(controller.state));
  }, [controller]);
  return searchParameters;
}

/**
 * The `useSyncSearchParameterManager` hook is responsible for synchronizing the URL with the state of the search interface.
 *
 * It uses two custom hooks: `useHistoryRouter` and `useSearchParameterManager`. `useHistoryRouter` is used to manage the current URL and
 * provides functions to replace or push a new URL to the browser's history. `useSearchParameterManager` is used to manage the state of
 * the search interface.
 */
export function useSyncSearchParameterManager({
  staticState,
  controller,
}: UseSyncSearchParameterManagerProps) {
  const historyRouter = useAppHistoryRouter();
  const state = useSearchParameterManager({staticState, controller});

  // Update the search interface.
  useEffect(() => {
    if (!controller || !historyRouter.url?.searchParams) {
      return;
    }
    const {toSearchParameters} = buildSSRSearchParameterSerializer();
    const searchParameters = toSearchParameters(historyRouter.url.searchParams);
    return controller.synchronize(searchParameters);
  }, [historyRouter.url?.searchParams, controller]);

  // Update the URL.
  const correctedUrl = useMemo(() => {
    if (!historyRouter.url) {
      return null;
    }
    const {serialize} = buildSSRSearchParameterSerializer();
    const newURL = new URL(historyRouter.url);
    return serialize(state.parameters, newURL);
  }, [state.parameters]);

  useEffect(() => {
    if (!correctedUrl || document.location.href === correctedUrl) {
      return;
    }

    const {pathname} = new URL(correctedUrl);
    if (pathname !== document.location.pathname) {
      return;
    }
    const isStaticState = controller === undefined;
    historyRouter[isStaticState ? 'replace' : 'push'](correctedUrl);
  }, [controller, correctedUrl]);
}

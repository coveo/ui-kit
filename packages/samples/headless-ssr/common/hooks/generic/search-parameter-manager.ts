'use client';

import {CoveoNextJsSearchParameterSerializer} from '@/common/components/common/search-parameter-serializer';
import {
  SearchParameterManager,
  SearchParameterManagerState,
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
    const {coveoSearchParameters} =
      CoveoNextJsSearchParameterSerializer.fromUrlSearchParameters(
        historyRouter.url.searchParams
      );
    return controller.synchronize(coveoSearchParameters);
  }, [historyRouter.url?.searchParams, controller]);

  // Update the URL.
  const correctedUrl = useMemo(() => {
    if (!historyRouter.url) {
      return null;
    }

    const newURL = new URL(historyRouter.url);
    CoveoNextJsSearchParameterSerializer.fromCoveoSearchParameters(
      state.parameters
    ).applyToUrlSearchParams(newURL.searchParams);

    return newURL.href;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.parameters]);

  useEffect(() => {
    if (!correctedUrl || document.location.href === correctedUrl) {
      return;
    }

    const isStaticState = controller === undefined;
    historyRouter[isStaticState ? 'replace' : 'push'](correctedUrl);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [controller, correctedUrl]);
}

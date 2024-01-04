'use client';

import {useEffect, useMemo} from 'react';
import {useSearchParameterManager} from '../../lib/react/engine';
import {useHistoryRouter} from '../common/history-router';
import {CoveoNextJsSearchParametersSerializer} from '../common/search-parameters-serializer';

/**
 * The `SearchParameterManager` hook is responsible for synchronizing the URL with the state of the search interface.
 *
 * It uses two custom hooks: `useHistoryRouter` and `useSearchParameterManager`. `useHistoryRouter` is used to manage the current URL and
 * provides functions to replace or push a new URL to the browser's history. `useSearchParameterManager` is used to manage the state of
 * the search interface.
 */
export default function SearchParameterManager() {
  const historyRouter = useHistoryRouter();
  const {state, methods} = useSearchParameterManager();
  // Synchronize the search interface with the current URL whenever the URL's search parameters change.
  useEffect(() => {
    if (!methods || !historyRouter.url?.searchParams) {
      return;
    }
    const {coveoSearchParameters} =
      CoveoNextJsSearchParametersSerializer.fromUrlSearchParameters(
        historyRouter.url.searchParams
      );
    return methods.synchronize(coveoSearchParameters);
  }, [historyRouter.url?.searchParams]);

  // Update the browser's URL
  const correctedUrl = useMemo(() => {
    if (!historyRouter.url) {
      return null;
    }

    const newURL = new URL(historyRouter.url);
    CoveoNextJsSearchParametersSerializer.fromCoveoSearchParameters(
      state.parameters
    ).applyToUrlSearchParams(newURL.searchParams);

    return newURL.href;
  }, [state.parameters]);

  useEffect(() => {
    if (!correctedUrl || document.location.href === correctedUrl) {
      return;
    }

    const isStaticState = methods === undefined;

    historyRouter[isStaticState ? 'replace' : 'push'](correctedUrl);
  }, [correctedUrl]);

  return <></>;
}

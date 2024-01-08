'use client';

import {useEffect, useMemo} from 'react';
import {useSearchParameterManager} from '../../lib/react/engine';
import {useAppHistoryRouter} from '../common/history-router';
import {CoveoNextJsSearchParameterSerializer} from '../common/search-parameter-serializer';

/**
 * The `SearchParameterManager` hook is responsible for synchronizing the URL with the state of the search interface.
 *
 * It uses two custom hooks: `useHistoryRouter` and `useSearchParameterManager`. `useHistoryRouter` is used to manage the current URL and
 * provides functions to replace or push a new URL to the browser's history. `useSearchParameterManager` is used to manage the state of
 * the search interface.
 */
export default function SearchParameterManager() {
  const historyRouter = useAppHistoryRouter();
  const {state, methods} = useSearchParameterManager();
  // Synchronize the search interface with the current URL whenever the URL's search parameters change.
  useEffect(() => {
    if (!methods || !historyRouter.url?.searchParams) {
      return;
    }
    const {coveoSearchParameters} =
      CoveoNextJsSearchParameterSerializer.fromUrlSearchParameters(
        historyRouter.url.searchParams
      );
    return methods.synchronize(coveoSearchParameters);
  }, [historyRouter.url?.searchParams, methods]);

  // Update the browser's URL
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

    const isStaticState = methods === undefined;

    historyRouter[isStaticState ? 'replace' : 'push'](correctedUrl);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [correctedUrl, methods]);

  return <></>;
}

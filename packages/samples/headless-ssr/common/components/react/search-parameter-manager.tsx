'use client';

import {useEffect, useMemo} from 'react';
import {useSearchParameterManager} from '../../lib/react/engine';
import {useHistoryRouter} from '../common/history-router';
import {CoveoNextJsSearchParametersSerializer} from '../common/search-parameters-serializer';

/**
 * The `UrlManager` hook is responsible for synchronizing the URL with the state of the search interface.
 *
 * It uses two custom hooks: `useHistoryRouter` and `useUrlManager`. `useHistoryRouter` is used to manage the current URL and
 * provides functions to replace or push a new URL to the browser's history. `useUrlManager` is used to manage the state of
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
  // FIXME: Understand why this gets trigger 2 time on the first page load
  const correctedUrl = useMemo(() => {
    if (!historyRouter.url) {
      return null;
    }

    const newURL = new URL(historyRouter.url);
    // FIXME: fix when last facet value is deselected
    CoveoNextJsSearchParametersSerializer.fromCoveoSearchParameters(
      state.parameters
    ).applyToUrlSearchParams(newURL.searchParams);

    return newURL.href;
  }, [state.parameters]); // TODO: not sure if should trigger effect on history url change. makes no sense since we are computing the corrected url based on the history url

  useEffect(() => {
    // FIXME: this effect gets triggered 2 times on the first page load. Means the component is rendered 2 times. That's because of the HydratedStateProvider component
    if (!correctedUrl || document.location.href === correctedUrl) {
      return;
    }

    // Adding this condition fixes the deselected facet value bug but brings back the sorting issue
    const isStaticState = methods === undefined;
    const shouldReplaceUrl = isStaticState;

    historyRouter[shouldReplaceUrl ? 'replace' : 'push'](correctedUrl);
  }, [correctedUrl]);

  return <></>;
}

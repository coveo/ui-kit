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
  useEffect(
    () =>
      methods &&
      historyRouter.url?.searchParams &&
      methods.synchronize(
        CoveoNextJsSearchParametersSerializer.parseSearchParameters(
          historyRouter.url.searchParams
        )
        // ).coveoSearchParameters
      ),
    [historyRouter.url?.searchParams]
  );

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
  }, [historyRouter.url, state.parameters]);

  useEffect(() => {
    // FIXME: bug when correctedUrl === historyRouter.url?.href
    if (!correctedUrl || correctedUrl === historyRouter.url?.href) {
      return;
    }

    const isStaticState = methods === undefined;

    historyRouter[isStaticState ? 'replace' : 'push'](correctedUrl);
  }, [correctedUrl]);

  return <></>;
}

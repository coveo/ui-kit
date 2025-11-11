'use client';

import {buildSSRSearchParameterSerializer} from '@coveo/headless/ssr';
import {useEffect, useMemo} from 'react';
import {useSearchParameterManager} from '../../lib/react/engine';
import {useAppHistoryRouter} from '../common/history-router';

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
    const {toSearchParameters} = buildSSRSearchParameterSerializer();
    const searchParameters = toSearchParameters(historyRouter.url.searchParams);
    return methods.synchronize(searchParameters);
  }, [historyRouter.url?.searchParams, methods]);

  // Update the browser's URL
  const correctedUrl = useMemo(() => {
    if (!historyRouter.url) {
      return null;
    }

    const newURL = new URL(historyRouter.url);
    const {serialize} = buildSSRSearchParameterSerializer();

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

    const isStaticState = methods === undefined;

    historyRouter[isStaticState ? 'replace' : 'push'](correctedUrl);
  }, [correctedUrl, methods]);

  return null;
}

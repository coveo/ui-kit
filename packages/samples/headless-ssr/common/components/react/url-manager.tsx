'use client';

import {useEffect, useMemo} from 'react';
import {useUrlManager} from '../../lib/react/engine';
import {useHistoryRouter} from '../common/history-router';

/**
 * The UrlManager hook is responsible for synchronizing the URL with the state of the search interface.
 *
 * It uses two custom hooks: `useHistoryRouter` and `useUrlManager`. `useHistoryRouter` is used to manage the current URL and
 * provides functions to replace or push a new URL to the browser's history. `useUrlManager` is used to manage the state of
 * the search interface.
 */
export default function UrlManager() {
  const historyRouter = useHistoryRouter();
  const {state, methods} = useUrlManager();

  // Synchronize the search interface with the current URL whenever the URL's search parameters change.
  useEffect(() => {
    methods &&
      historyRouter.url &&
      methods.synchronize(historyRouter.url.search.slice(1));
  }, [historyRouter.url?.searchParams]);

  // Update the browser's URL
  const correctedUrl = useMemo(() => {
    if (!historyRouter.url) {
      return null;
    }
    const newURL = new URL(historyRouter.url);
    newURL.search = state.fragment;
    return newURL.href;
  }, [historyRouter.url, state.fragment]);

  useEffect(() => {
    if (!correctedUrl || correctedUrl === historyRouter.url?.href) {
      return;
    }

    const isStaticState = methods === undefined;

    historyRouter[isStaticState ? 'replace' : 'push'](correctedUrl);
  }, [correctedUrl]);

  return <></>;
}

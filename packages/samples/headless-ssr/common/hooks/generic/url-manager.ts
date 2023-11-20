'use client';

import {UrlManager, UrlManagerState} from '@coveo/headless/ssr';
import {useEffect, useMemo, useState} from 'react';
import {useHistoryRouter} from '../../components/common/history-router';

interface UseSyncUrlManagerProps {
  staticState: UrlManagerState;
  controller?: UrlManager;
}

function useUrlManager({staticState, controller}: UseSyncUrlManagerProps) {
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
 * The useSyncUrlManager hook is responsible for synchronizing the URL with the state of the search interface.
 *
 * It uses two custom hooks: `useHistoryRouter` and `useUrlManager`. `useHistoryRouter` is used to manage the current URL and
 * provides functions to replace or push a new URL to the browser's history. `useUrlManager` is used to manage the state of
 * the search interface.
 */
export function useSyncUrlManager({
  staticState,
  controller,
}: UseSyncUrlManagerProps) {
  const historyRouter = useHistoryRouter();
  const state = useUrlManager({staticState, controller});

  // Update the search interface.
  useEffect(() => {
    controller &&
      historyRouter.url &&
      controller.synchronize(historyRouter.url.search.slice(1));
  }, [historyRouter.url?.searchParams]);

  // Update the URL.
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

    const isStaticState = controller === undefined;

    historyRouter[isStaticState ? 'replace' : 'push'](correctedUrl);
  }, [correctedUrl]);
}

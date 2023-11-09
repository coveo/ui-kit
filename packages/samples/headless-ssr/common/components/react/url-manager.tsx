'use client';

import {useEffect, useMemo} from 'react';
import {useUrlManager} from '../../lib/react/engine';
import {useHistoryRouter} from '../common/search-parameters';

export default function UrlManager() {
  const historyRouter = useHistoryRouter();
  const {state, methods} = useUrlManager();

  // Update the search interface.
  useEffect(() => {
    methods &&
      historyRouter.url &&
      methods.synchronize(historyRouter.url.search.slice(1));
  }, [historyRouter.url?.search]);

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

    const isStaticState = methods === undefined;

    historyRouter[isStaticState ? 'replace' : 'push'](correctedUrl);
  }, [correctedUrl]);

  return <></>;
}

'use client';

import {CoveoNextJsSearchParameterSerializer} from '@/common/components/common/search-parameter-serializer';
import {
  SearchParameterManager,
  SearchParameterManagerState,
} from '@coveo/headless/ssr';
import {useRouter} from 'next/navigation';
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
  const router = useRouter();

  // Update the search interface.
  useEffect(() => {
    console.log('');
    console.log('---' + historyRouter.url?.searchParams.toString() + '---');
    controller &&
      historyRouter.url &&
      controller.synchronize(
        CoveoNextJsSearchParameterSerializer.fromUrlSearchParameters(
          historyRouter.url.searchParams
        ).coveoSearchParameters
      );
  }, [historyRouter.url?.searchParams]);

  // Update the URL.
  const correctedUrl = useMemo(() => {
    if (!historyRouter.url) {
      return null;
    }

    const newURL = new URL(historyRouter.url);
    console.log('');
    console.group('*********************');
    console.log('state           ->', JSON.stringify(state.parameters));

    CoveoNextJsSearchParameterSerializer.fromCoveoSearchParameters(
      state.parameters
    ).applyToUrlSearchParams(newURL.searchParams);

    return newURL.href;
  }, [state.parameters]); // TODO: check if should put missing deps
  // }, [historyRouter.url, state.parameters]); // TODO: check if should put missing deps

  useEffect(() => {
    if (!correctedUrl || document.location.href === correctedUrl) {
      return;
    }

    const isStaticState = controller === undefined;
    if (isStaticState) {
      window.history.pushState(null, document.title, correctedUrl);
      console.log('== replaceState == ');
    } else {
      window.history.pushState(null, document.title, correctedUrl);
      console.group('== pushState == ', correctedUrl.toString());
      console.log('Current href: ', document.location.href);
      console.log('corrected url:', correctedUrl);
      console.groupEnd();
    }

    // historyRouter[isStaticState ? 'replace' : 'push'](correctedUrl);
  }, [controller, correctedUrl]);
}

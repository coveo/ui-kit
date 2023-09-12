'use client';

import {UrlManager, UrlManagerState} from '@coveo/headless/ssr';
import {NavigateOptions} from 'next/dist/shared/lib/app-router-context';
import {useRouter, useSearchParams} from 'next/navigation';
import {useEffect, useState} from 'react';

interface UseSyncSearchParametersProps {
  ssrState: UrlManagerState;
  controller?: UrlManager;
}

function useSearchParameters({
  ssrState,
  controller,
}: UseSyncSearchParametersProps) {
  const [searchParameters, setSearchParameters] = useState(ssrState);
  useEffect(() => {
    if (!controller) {
      return;
    }
    return controller.subscribe(() => setSearchParameters(controller.state));
  }, [controller]);
  return searchParameters;
}

export function useSyncSearchParameters({
  ssrState,
  controller,
}: UseSyncSearchParametersProps) {
  const {push, replace} = useRouter();
  const searchParams = useSearchParams();
  const state = useSearchParameters({ssrState, controller});

  // Update the search interface.
  useEffect(
    () => {
      if (!controller) {
        return;
      }
      if (searchParams === null) {
        return;
      }
      controller.synchronize(searchParams.toString());
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [searchParams]
  );

  // Update the URL.
  useEffect(() => {
    if (state.fragment === searchParams.toString()) {
      return;
    }
    const isInitialState = controller === undefined;
    if (isInitialState) {
      replace('?' + state.fragment, {shallow: true} as NavigateOptions);
    } else {
      push('?' + state.fragment, {shallow: true} as NavigateOptions);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.fragment]);
}

'use client';

import {
  SearchParameterManager,
  SearchParameterManagerState,
} from '@coveo/headless/ssr';
import {useEffect, useMemo, useState} from 'react';
import {useHistoryRouter} from '../../components/common/search-parameters';
import {CoveoNextJsSearchParametersSerializer} from '../../components/common/search-parameters-serializer';

interface UseSyncSearchParametersProps {
  staticState: SearchParameterManagerState;
  controller?: SearchParameterManager;
}

function useSearchParameters({
  staticState,
  controller,
}: UseSyncSearchParametersProps) {
  const [searchParameters, setSearchParameters] = useState(staticState);
  useEffect(() => {
    if (!controller) {
      return;
    }
    return controller.subscribe(() => setSearchParameters(controller.state));
  }, [controller]);
  return searchParameters;
}

export function useSyncSearchParameters({
  staticState,
  controller,
}: UseSyncSearchParametersProps) {
  const historyRouter = useHistoryRouter();
  const state = useSearchParameters({staticState, controller});

  // Update the search interface.
  useEffect(
    () =>
      controller &&
      historyRouter.url?.searchParams &&
      controller.synchronize(
        CoveoNextJsSearchParametersSerializer.fromClientSideUrlSearchParams(
          historyRouter.url.searchParams
        ).coveoSearchParameters
      ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [historyRouter.url?.searchParams]
  );

  // Update the URL.
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
    if (!correctedUrl || correctedUrl === historyRouter.url?.href) {
      return;
    }
    const isStaticState = controller === undefined;
    if (isStaticState) {
      historyRouter.replace(correctedUrl);
    } else {
      historyRouter.push(correctedUrl);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [correctedUrl]);
}

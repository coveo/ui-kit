'use client';

import {SearchParameters} from '@coveo/headless';
import {
  SearchParameterManager,
  SearchParameterManagerState,
} from '@coveo/headless/ssr';
import {useCallback, useEffect, useMemo, useReducer, useState} from 'react';
import {CoveoNextJsSearchParametersSerializer} from '../common/search-parameters-serializer';

interface UseSyncSearchParametersProps {
  initialState: SearchParameterManagerState;
  controller?: SearchParameterManager;
}

function getUrl() {
  if (typeof window === 'undefined') {
    return null;
  }
  return new URL(document.location.href);
}

function useUrlSearchParams() {
  const [urlSearchParams, onUrlSearchParamsChanged] = useReducer(
    () => getUrl()?.searchParams,
    undefined as never
  );
  useEffect(() => {
    window.addEventListener('popstate', onUrlSearchParamsChanged);
    return () =>
      window.removeEventListener('popstate', onUrlSearchParamsChanged);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return urlSearchParams;
}

function useCoveoSearchParameters(
  initialParameters: SearchParameters,
  controller?: SearchParameterManager
) {
  const [searchParameters, setSearchParameters] = useState(initialParameters);
  useEffect(() => {
    if (!controller) {
      return;
    }
    return controller.subscribe(() =>
      setSearchParameters(controller.state.parameters)
    );
  }, [controller]);
  return searchParameters;
}

export function useSyncSearchParameters(props: UseSyncSearchParametersProps) {
  const urlSearchParams = useUrlSearchParams();
  const coveoSearchParameters = useCoveoSearchParameters(
    props.initialState.parameters,
    props.controller
  );
  const urlFromCoveoSearchParameters = useMemo(() => {
    const newUrl = getUrl();
    if (!newUrl) {
      return null;
    }
    CoveoNextJsSearchParametersSerializer.fromCoveoSearchParameters(
      coveoSearchParameters
    ).applyToUrlSearchParams(newUrl.searchParams);
    return newUrl;
  }, [coveoSearchParameters]);

  const updateCoveoSearchParameters = useCallback(
    (coveoSearchParameters: SearchParameters) =>
      props.controller?.synchronize(coveoSearchParameters),
    [props.controller]
  );
  const updateUrlSearchParams = useCallback(
    (options: {href: string; isInitialState: boolean}) =>
      (options.isInitialState ? history.replaceState : history.pushState).call(
        history,
        null,
        document.title,
        options.href
      ),
    []
  );

  useEffect(
    () =>
      urlSearchParams &&
      updateCoveoSearchParameters(
        CoveoNextJsSearchParametersSerializer.fromClientSideUrlSearchParams(
          urlSearchParams
        ).coveoSearchParameters
      ),
    [updateCoveoSearchParameters, urlSearchParams]
  );
  useEffect(() => {
    if (!urlFromCoveoSearchParameters) {
      return;
    }
    if (urlFromCoveoSearchParameters.href === document.location.href) {
      return;
    }
    updateUrlSearchParams({
      isInitialState: !props.controller,
      href: urlFromCoveoSearchParameters.href,
    });
  }, [updateUrlSearchParams, props.controller, urlFromCoveoSearchParameters]);
}

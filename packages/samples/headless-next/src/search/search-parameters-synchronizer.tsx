'use client';

import {SearchParameters} from '@coveo/headless';
import {useSearchParams, usePathname} from 'next/navigation';
import {
  DependencyList,
  EffectCallback,
  FunctionComponent,
  useEffect,
  useRef,
} from 'react';
import {useSearchParametersManager} from '@/common/engine-definition.client';
import {ShallowRouter, useShallowRouter} from '@/hooks/use-shallow-router';
import {SearchParameterSerializer} from '@/utils/search-parameter-serializer';
import {compareSearchParams} from '@/utils/url';

function useEffectCount(
  effect: (index: number) => ReturnType<EffectCallback>,
  deps?: DependencyList | undefined
) {
  const callsCount = useRef<number>(0);
  useEffect(
    () => {
      const destructor = effect(callsCount.current);
      callsCount.current++;
      return destructor;
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    deps
  );
}

function updateRouter(
  router: ShallowRouter,
  {
    parameters,
    isInitialState,
  }: {
    parameters: SearchParameters;
    isInitialState: boolean;
  }
) {
  const newSearchParams = new SearchParameterSerializer(
    parameters
  ).mapURLSearchParams(router.searchParams);
  if (compareSearchParams(router.searchParams, newSearchParams)) {
    return;
  }
  const serializedSearchParams = newSearchParams.toString();
  const url = serializedSearchParams.length
    ? `${router.pathname}?${serializedSearchParams}`
    : router.pathname;
  if (isInitialState) {
    router.replace(url);
  } else {
    router.push(url);
  }
}

export const SearchParametersSynchronizer: FunctionComponent = () => {
  const {state, methods} = useSearchParametersManager();
  const router = useShallowRouter({
    initialPathname: usePathname(),
    initialSearchParams: useSearchParams(),
  });
  useEffectCount(
    (index) =>
      updateRouter(router, {
        parameters: state.parameters,
        isInitialState: index === 0,
      }),
    [state.parameters]
  );
  useEffectCount(
    (index) => {
      if (!methods) {
        return;
      }
      if (index === 0) {
        return;
      }
      const {parameters} = SearchParameterSerializer.fromURLSearchParams(
        router.searchParams
      );
      methods.synchronize(parameters);
    },
    [router.pathname, router.searchParams.toString(), methods]
  );

  return null;
};

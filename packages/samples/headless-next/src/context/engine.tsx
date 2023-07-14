'use client';

import {SearchParameters} from '@coveo/headless';
import {FunctionComponent, PropsWithChildren, useState, useEffect} from 'react';
import {
  SearchExecutionResult,
  SearchHydrationResult,
  hydrate,
} from '@/common/engine-definition';
import {
  LiveSearchProvider,
  SearchSnapshotProvider,
} from '@/common/engine-definition.client';

const isServerSide = typeof window === 'undefined';

export interface SearchProviderProps extends SearchExecutionResult {
  parameters: SearchParameters;
}

export const SearchProvider: FunctionComponent<
  PropsWithChildren<SearchProviderProps>
> = ({children, ...snapshot}) => {
  const [hydrationResult, setHydrationResult] =
    useState<SearchHydrationResult | null>(null);

  useEffect(() => {
    if (isServerSide) {
      return;
    }
    hydrate({
      searchFulfilledAction: snapshot.searchFulfilledAction,
      controllers: {
        searchParametersManager: {initialParameters: snapshot.parameters},
      },
    }).then((result) => setHydrationResult(result));
  }, [snapshot.searchFulfilledAction, snapshot.parameters]);

  if (!hydrationResult) {
    return (
      <SearchSnapshotProvider controllers={snapshot.controllers}>
        {children}
      </SearchSnapshotProvider>
    );
  }

  return (
    <LiveSearchProvider
      engine={hydrationResult.engine}
      controllers={hydrationResult.controllers}
    >
      {children}
    </LiveSearchProvider>
  );
};

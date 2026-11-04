import {useOptimistic} from 'react';
import type {RegularFacetAction, RegularFacetProps} from '@coveo/thermidor-schema/zod3';
import {useGesture} from '../session-request.js';

type RegularFacetValues = NonNullable<RegularFacetProps['values']>;

const NO_VALUES: RegularFacetValues = [];

export interface OptimisticRegularFacet {
  values: RegularFacetValues;
  /** `numberOfResults` describes a value not listed yet, such as a facet-search result. */
  toggleSelect: (value: string, numberOfResults?: number) => void;
  clearAll: () => void;
}

/** The show-more/less actions have no client-side projection, so they stay plain dispatches. */
export function useOptimisticRegularFacet(
  props: RegularFacetProps,
  dispatch: (action: RegularFacetAction) => void | Promise<void>
): OptimisticRegularFacet {
  const [values, addOptimisticValues] = useOptimistic(props.values ?? NO_VALUES);
  const startGesture = useGesture();

  const toggleSelect = (value: string, numberOfResults = 0) => {
    const listed = values.find((candidate) => candidate.value === value);
    const nextState = listed?.state === 'selected' ? 'idle' : 'selected';
    // A value selected from the facet search isn't listed yet: the producer pins it on top.
    const next: RegularFacetValues = listed
      ? values.map((candidate) =>
          candidate.value === value ? {...candidate, state: nextState} : candidate
        )
      : [{value, numberOfResults, state: nextState}, ...values];
    startGesture(
      () => addOptimisticValues(next),
      () => dispatch({event: {name: 'toggleSelect', context: {value}}})
    );
  };

  const clearAll = () => {
    startGesture(
      () =>
        addOptimisticValues(values.map((candidate) => ({...candidate, state: 'idle' as const}))),
      () => dispatch({event: {name: 'clearAllActiveValues', context: {}}})
    );
  };

  return {values, toggleSelect, clearAll};
}

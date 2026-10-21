import type {RegularFacetAction, RegularFacetProps} from '@coveo/thermidor-schema/zod3';
import {useOptimisticValue} from '../use-optimistic-value.js';

type RegularFacetValues = NonNullable<RegularFacetProps['values']>;

const NO_VALUES: RegularFacetValues = [];

export interface OptimisticRegularFacet {
  values: RegularFacetValues;
  toggleSelect: (value: string) => void;
  clearAll: () => void;
}

/** The show-more/less actions have no client-side projection, so they stay plain dispatches. */
export function useOptimisticRegularFacet(
  props: RegularFacetProps,
  dispatch: (action: RegularFacetAction) => void
): OptimisticRegularFacet {
  const {value: values, dispatchOptimistic} = useOptimisticValue(
    props.values ?? NO_VALUES,
    dispatch
  );

  const toggleSelect = (value: string) => {
    const nextState =
      values.find((candidate) => candidate.value === value)?.state === 'selected'
        ? 'idle'
        : 'selected';
    dispatchOptimistic({
      action: {event: {name: 'toggleSelect', context: {value}}},
      next: (current) =>
        current.map((candidate) =>
          candidate.value === value ? {...candidate, state: nextState} : candidate
        ),
      // Flips only the target (`SearchActionHandler.handleRegularFacetToggle`, `single=false`).
      coalesce: 'involutive',
      invalidates: ['results'],
    });
  };

  const clearAll = () => {
    dispatchOptimistic({
      action: {event: {name: 'clearAllActiveValues', context: {}}},
      next: (current) => current.map((candidate) => ({...candidate, state: 'idle' as const})),
      coalesce: 'absolute',
      invalidates: ['results'],
    });
  };

  return {values, toggleSelect, clearAll};
}

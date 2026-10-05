import type {RegularFacetAction, RegularFacetProps} from '@coveo/thermidor-schema/zod3';
import {useOptimisticValue} from '../use-optimistic-value.js';

type RegularFacetValues = NonNullable<RegularFacetProps['values']>;

const NO_VALUES: RegularFacetValues = [];

export interface OptimisticRegularFacet {
  /** The values to render: the producer's, with this facet's outstanding gestures applied. */
  values: RegularFacetValues;
  toggleSelect: (value: string) => void;
  clearAll: () => void;
}

/**
 * The regular facet's values, and the two gestures that carry one optimistically.
 *
 * Only those two: `showMoreValues`, `showLessValues` and `showMoreSearchResults` have no
 * client-side projection — their outcome is a count only the producer knows — so they stay plain
 * dispatches at their call site, where the absence of an optimistic value is visible.
 *
 * What each gesture may drop is checked against the producer's handler rather than against
 * anything on screen, which is why the two declarations below live here and not in the renderer.
 */
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
      // `toggleSelect` flips the targeted value and leaves every sibling untouched
      // (`SearchActionHandler.handleRegularFacetToggle` with `single=false`), so a queued pair on
      // the same value can go whole — but a queued toggle on ANOTHER value never can.
      coalesce: 'involutive',
    });
  };

  const clearAll = () => {
    dispatchOptimistic({
      action: {event: {name: 'clearAllActiveValues', context: {}}},
      next: (current) => current.map((candidate) => ({...candidate, state: 'idle' as const})),
      // Clearing sets every value to idle whatever was queued ahead of it, so the queued toggles
      // it replaces cannot change the outcome.
      coalesce: 'absolute',
    });
  };

  return {values, toggleSelect, clearAll};
}

import {createSelector} from '@reduxjs/toolkit';
import type {StaticFilterSection} from '../../state/state-sections.js';

/**
 * Given a static filter state, returns an array of selected filter expressions.
 * @param state The static filter state that contains the static filter set.
 * @returns An array of filter expressions.
 */
export const selectStaticFilterExpressions = createSelector(
  (state: Partial<StaticFilterSection>) => state.staticFilterSet,
  (staticFilterSet) => {
    const filters = Object.values(staticFilterSet || {});
    return filters.map((filter) => {
      const selected = filter.values.filter(
        (value) => value.state === 'selected' && !!value.expression.trim()
      );

      const expression = selected.map((value) => value.expression).join(' OR ');
      return selected.length > 1 ? `(${expression})` : expression;
    });
  }
);

import {createReducer} from '@reduxjs/toolkit';
import {restoreSearchParameters} from '../search-parameters/search-parameter-actions';
import {
  deselectAllStaticFilters,
  deselectAllStaticFilterValues,
  registerStaticFilter,
  toggleSelectStaticFilterValue,
} from './static-filter-set-actions';
import {getStaticFilterSetInitialState} from './static-filter-set-state';

export const staticFilterSetReducer = createReducer(
  getStaticFilterSetInitialState(),
  (builder) =>
    builder
      .addCase(registerStaticFilter, (state, action) => {
        const filter = action.payload;
        const {id} = filter;

        if (id in state) {
          return;
        }

        state[id] = filter;
      })
      .addCase(toggleSelectStaticFilterValue, (state, action) => {
        const {id, value} = action.payload;
        const filter = state[id];

        if (!filter) {
          return;
        }

        const target = filter.values.find((v) => v.caption === value.caption);

        if (!target) {
          return;
        }

        const isSelected = target.state === 'selected';
        target.state = isSelected ? 'idle' : 'selected';
      })
      .addCase(deselectAllStaticFilterValues, (state, action) => {
        const id = action.payload;
        const filter = state[id];

        if (!filter) {
          return;
        }

        filter.values.forEach((v) => (v.state = 'idle'));
      })
      .addCase(deselectAllStaticFilters, (state) => {
        Object.values(state).forEach((filter) => {
          filter.values.forEach((v) => (v.state = 'idle'));
        });
      })
      .addCase(restoreSearchParameters, (state, action) => {
        const sf = action.payload.sf || {};

        Object.entries(state).forEach(([id, filter]) => {
          const selected = sf[id] || [];

          filter.values.forEach((value) => {
            value.state = selected.includes(value.caption)
              ? 'selected'
              : 'idle';
          });
        });
      })
);

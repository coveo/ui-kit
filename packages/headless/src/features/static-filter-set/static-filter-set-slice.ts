import {createReducer} from '@reduxjs/toolkit';
import {deselectAllBreadcrumbs} from '../breadcrumb/breadcrumb-actions.js';
import {restoreSearchParameters} from '../search-parameters/search-parameter-actions.js';
import {
  deselectAllStaticFilterValues,
  registerStaticFilter,
  toggleExcludeStaticFilterValue,
  toggleSelectStaticFilterValue,
} from './static-filter-set-actions.js';
import {getStaticFilterSetInitialState} from './static-filter-set-state.js';

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
      .addCase(toggleExcludeStaticFilterValue, (state, action) => {
        const {id, value} = action.payload;
        const filter = state[id];

        if (!filter) {
          return;
        }

        const target = filter.values.find((v) => v.caption === value.caption);

        if (!target) {
          return;
        }

        const isExcluded = target.state === 'excluded';
        target.state = isExcluded ? 'idle' : 'excluded';
      })
      .addCase(deselectAllStaticFilterValues, (state, action) => {
        const id = action.payload;
        const filter = state[id];

        if (!filter) {
          return;
        }

        filter.values.forEach((v) => {
          v.state = 'idle';
        });
      })
      .addCase(deselectAllBreadcrumbs, (state) => {
        Object.values(state).forEach((filter) => {
          filter.values.forEach((v) => {
            v.state = 'idle';
          });
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

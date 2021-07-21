import {createReducer} from '@reduxjs/toolkit';
import {DateRangeRequest} from '../../controllers';
import {
  registerDateFacet,
  updateDateFacetValues,
} from '../facets/range-facets/date-facet-set/date-facet-actions';
import {restoreSearchParameters} from '../search-parameters/search-parameter-actions';
import {formatDate, RelativeDate} from './relative-date';
import {
  getRelativeDateSetInitialState,
  RelativeDateMap,
  RelativeDateSetState,
} from './relative-date-set-state';

export const relativeDateSetReducer = createReducer(
  getRelativeDateSetInitialState(),
  (builder) => {
    builder
      .addCase(registerDateFacet, (state, {payload}) => {
        handleUpdateFacetValues(state, payload.facetId, payload.currentValues);
      })
      .addCase(updateDateFacetValues, (state, {payload}) => {
        handleUpdateFacetValues(state, payload.facetId, payload.values);
      })
      .addCase(restoreSearchParameters, (state, action) => {
        const df = action.payload.df || {};
        Object.entries(df).forEach(([facetId, currentValues]) => {
          handleUpdateFacetValues(state, facetId, currentValues);
        });
      });
  }
);

function handleUpdateFacetValues(
  state: RelativeDateSetState,
  facetId: string,
  values?: DateRangeRequest[]
) {
  if (!values) {
    return;
  }

  if (!state[facetId]) {
    state[facetId] = [];
  }

  values.forEach((value) => {
    addIfRelative(value.start, state[facetId]);
    addIfRelative(value.end, state[facetId]);
  });
}

function addIfRelative(
  value: string | RelativeDate | RelativeDateMap,
  maps: RelativeDateMap[]
) {
  if (typeof value === 'string') {
    return;
  }

  if (
    maps.find(
      ({period, amount, unit}) =>
        period === value.period &&
        amount === value.amount &&
        unit === value.unit
    )
  ) {
    return;
  }

  maps.push({
    ...value,
    value: 'value' in value ? value.value : formatDate(value),
  });
}

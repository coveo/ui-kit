import {createReducer} from '@reduxjs/toolkit';
import {selectCategoryFacetSearchResult} from '../../facets/facet-search-set/category/category-facet-search-actions.js';
import {
  excludeFacetSearchResult,
  selectFacetSearchResult,
} from '../../facets/facet-search-set/specific/specific-facet-search-actions.js';
import type {ToggleSelectFacetValueActionCreatorPayload} from '../../facets/facet-set/facet-set-actions.js';
import type {DateRangeRequest} from '../../facets/range-facets/date-facet-set/interfaces/request.js';
import type {NumericRangeRequest} from '../../facets/range-facets/numeric-facet-set/interfaces/request.js';
import {setView} from '../context/context-actions.js';
import {
  type ToggleSelectCategoryFacetValuePayload,
  toggleSelectCategoryFacetValue,
} from '../facets/category-facet/category-facet-actions.js';
import {
  clearAllCoreFacets,
  type DeselectAllValuesInCoreFacetPayload,
  deleteAllCoreFacets,
  deselectAllValuesInCoreFacet,
} from '../facets/core-facet/core-facet-actions.js';
import {
  type ToggleSelectDateFacetValuePayload,
  toggleExcludeDateFacetValue,
  toggleSelectDateFacetValue,
} from '../facets/date-facet/date-facet-actions.js';
import {
  type ToggleSelectLocationFacetValuePayload,
  toggleSelectLocationFacetValue,
} from '../facets/location-facet/location-facet-actions.js';
import {
  type ToggleExcludeNumericFacetValuePayload,
  type ToggleSelectNumericFacetValuePayload,
  toggleExcludeNumericFacetValue,
  toggleSelectNumericFacetValue,
  type UpdateManualNumericFacetRangePayload,
  updateManualNumericFacetRange,
} from '../facets/numeric-facet/numeric-facet-actions.js';
import {
  toggleExcludeFacetValue,
  toggleSelectFacetValue,
} from '../facets/regular-facet/regular-facet-actions.js';
import {
  type NextPagePayload,
  nextPage,
  type PreviousPagePayload,
  previousPage,
  type SelectPagePayload,
  type SetPageSizePayload,
  selectPage,
  setPageSize,
} from '../pagination/pagination-actions.js';
import {restoreProductListingParameters} from '../product-listing-parameters/product-listing-parameters-actions.js';
import {type UpdateQueryPayload, updateQuery} from '../query/query-actions.js';
import {restoreSearchParameters} from '../search-parameters/search-parameters-actions.js';
import {type ApplySortPayload, applySort} from '../sort/sort-actions.js';
import {
  type CommerceParametersState,
  getCommerceParametersInitialState,
} from './parameters-state.js';

export const parametersReducer = createReducer(
  getCommerceParametersInitialState(),
  (builder) => {
    builder
      .addCase(nextPage, (state, action) =>
        handleNextPage(state, action.payload)
      )

      .addCase(previousPage, (state, action) =>
        handlePreviousPage(state, action.payload)
      )

      .addCase(selectPage, (state, action) =>
        handleSelectPage(state, action.payload)
      )

      .addCase(setPageSize, (state, action) =>
        handleSetPageSize(state, action.payload)
      )

      .addCase(applySort, (state, action) =>
        handleApplySort(state, action.payload)
      )

      .addCase(updateQuery, (state, action) =>
        handleUpdateQuery(state, action.payload)
      )

      .addCase(clearAllCoreFacets, (state) => handleClearAllCoreFacets(state))

      .addCase(deleteAllCoreFacets, (state) => handleClearAllCoreFacets(state))

      .addCase(deselectAllValuesInCoreFacet, (state, action) =>
        handleDeselectAllValuesInCoreFacet(state, action.payload)
      )

      .addCase(toggleSelectCategoryFacetValue, (state, action) =>
        handleToggleCategoryFacetValue(state, action.payload)
      )

      .addCase(selectCategoryFacetSearchResult, (state, action) =>
        handleSelectCategoryFacetSearchResult(state, action)
      )

      .addCase(toggleSelectFacetValue, (state, action) =>
        handleToggleSelectFacetValue(state, action.payload)
      )

      .addCase(toggleExcludeFacetValue, (state, action) =>
        handleToggleExcludeFacetValue(state, action.payload)
      )

      .addCase(selectFacetSearchResult, (state, action) =>
        handleSelectFacetSearchResult(state, action)
      )

      .addCase(excludeFacetSearchResult, (state, action) =>
        handleExcludeFacetSearchResult(state, action)
      )

      .addCase(toggleSelectNumericFacetValue, (state, action) =>
        handleToggleSelectNumericFacetValue(state, action.payload)
      )

      .addCase(toggleExcludeNumericFacetValue, (state, action) =>
        handleToggleExcludeNumericFacetValue(state, action.payload)
      )

      .addCase(updateManualNumericFacetRange, (state, action) =>
        handleUpdateManualNumericFacetRange(state, action.payload)
      )

      .addCase(toggleSelectDateFacetValue, (state, action) =>
        handleToggleSelectDateFacetValue(state, action.payload)
      )

      .addCase(toggleExcludeDateFacetValue, (state, action) =>
        handleToggleExcludeDateFacetValue(state, action.payload)
      )

      .addCase(toggleSelectLocationFacetValue, (state, action) =>
        handleToggleSelectLocationFacetValue(state, action.payload)
      )

      .addCase(setView, getCommerceParametersInitialState)

      .addCase(restoreProductListingParameters, (state, action) => {
        state = action.payload;
        return state;
      })

      .addCase(restoreSearchParameters, (state, action) => {
        state = action.payload;
        return state;
      });
  }
);

const handleNextPage = (
  state: CommerceParametersState,
  payload?: NextPagePayload
) => {
  if (payload?.slotId !== undefined) {
    return;
  }

  if (state.page !== undefined) {
    state.page++;
    return;
  }

  state.page = 1;
};

const handlePreviousPage = (
  state: CommerceParametersState,
  payload?: PreviousPagePayload
) => {
  if (payload?.slotId !== undefined) {
    return;
  }

  if (state.page !== undefined && state.page > 1) {
    state.page--;
    return;
  }

  state.page = undefined;
};

const handleSelectPage = (
  state: CommerceParametersState,
  payload: SelectPagePayload
) => {
  if (payload?.slotId !== undefined) {
    return;
  }

  state.page = payload.page > 0 ? payload.page : undefined;
};

const handleSetPageSize = (
  state: CommerceParametersState,
  payload: SetPageSizePayload
) => {
  if (payload?.slotId !== undefined) {
    return;
  }

  state.page = undefined;

  if (payload.pageSize === 0) {
    state.perPage = undefined;
    return;
  }

  state.perPage = payload.pageSize;
};

const handleApplySort = (
  state: CommerceParametersState,
  payload: ApplySortPayload
) => {
  state.page = undefined;
  state.sortCriteria = payload;
};

const handleUpdateQuery = (
  state: CommerceParametersState,
  payload: UpdateQueryPayload
) => {
  state.page = undefined;

  const {query} = payload;
  if (query === undefined || query.trim() === '') {
    state.q = undefined;
    return;
  }

  state.q = query;
};

const handleClearAllCoreFacets = (state: CommerceParametersState) => {
  state.page = undefined;
  state.cf = undefined;
  state.df = undefined;
  state.dfExcluded = undefined;
  state.lf = undefined;
  state.mnf = undefined;
  state.mnfExcluded = undefined;
  state.nf = undefined;
  state.nfExcluded = undefined;
  state.f = undefined;
  state.fExcluded = undefined;
};

const handleDeselectAllValuesInCoreFacet = (
  state: CommerceParametersState,
  payload: DeselectAllValuesInCoreFacetPayload
) => {
  const {facetId} = payload;

  state.page = undefined;

  if (state.cf) {
    delete state.cf[facetId];
    Object.keys(state.cf).length === 0 && delete state.cf;
  }

  if (state.df) {
    delete state.df[facetId];
    Object.keys(state.df).length === 0 && delete state.df;
  }

  if (state.dfExcluded) {
    delete state.dfExcluded[facetId];
    Object.keys(state.dfExcluded).length === 0 && delete state.dfExcluded;
  }

  if (state.lf) {
    delete state.lf[facetId];
    Object.keys(state.lf).length === 0 && delete state.lf;
  }

  if (state.mnf) {
    delete state.mnf[facetId];
    Object.keys(state.mnf).length === 0 && delete state.mnf;
  }

  if (state.mnfExcluded) {
    delete state.mnfExcluded[facetId];
    Object.keys(state.mnfExcluded).length === 0 && delete state.mnfExcluded;
  }

  if (state.nf) {
    delete state.nf[facetId];
    Object.keys(state.nf).length === 0 && delete state.nf;
  }

  if (state.nfExcluded) {
    delete state.nfExcluded[facetId];
    Object.keys(state.nfExcluded).length === 0 && delete state.nfExcluded;
  }

  if (state.f) {
    delete state.f[facetId];
    Object.keys(state.f).length === 0 && delete state.f;
  }

  if (state.fExcluded) {
    delete state.fExcluded[facetId];
    Object.keys(state.fExcluded).length === 0 && delete state.fExcluded;
  }
};

const handleToggleCategoryFacetValue = (
  state: CommerceParametersState,
  payload: ToggleSelectCategoryFacetValuePayload
) => {
  state.page = undefined;

  if (payload.selection.state === 'selected') {
    state.cf ??= {};
    delete state.cf[payload.facetId];
    if (Object.keys(state.cf).length === 0) {
      state.cf = undefined;
    }
    return;
  }

  state.cf ??= {};
  state.cf[payload.facetId] = payload.selection.path;
};

const handleSelectCategoryFacetSearchResult = (
  state: CommerceParametersState,
  action: ReturnType<typeof selectCategoryFacetSearchResult>
) => {
  const payload = action.payload;
  state.page = undefined;

  state.cf ??= {};
  state.cf[payload.facetId] = [...payload.value.path, payload.value.rawValue];
};

const handleToggleSelectFacetValue = (
  state: CommerceParametersState,
  payload: ToggleSelectFacetValueActionCreatorPayload
) => {
  state.page = undefined;

  unsetRegularValue(
    state,
    'fExcluded',
    state.fExcluded,
    payload.facetId,
    payload.selection.value
  );

  switch (payload.selection.state) {
    case 'selected':
      unsetRegularValue(
        state,
        'f',
        state.f,
        payload.facetId,
        payload.selection.value
      );
      break;
    case 'excluded':
    case 'idle':
      state.f ??= {};
      state.f[payload.facetId] = [
        ...(state.f[payload.facetId] ?? []),
        payload.selection.value,
      ];
      break;
  }
};

const handleSelectFacetSearchResult = (
  state: CommerceParametersState,
  action: ReturnType<typeof selectFacetSearchResult>
) => {
  const payload = action.payload;
  state.page = undefined;

  unsetRegularValue(
    state,
    'fExcluded',
    state.fExcluded,
    payload.facetId,
    payload.value.rawValue
  );

  state.f ??= {};
  state.f[payload.facetId] = [
    ...(state.f[payload.facetId] ?? []),
    payload.value.rawValue,
  ];
};

const handleToggleExcludeFacetValue = (
  state: CommerceParametersState,
  payload: ToggleSelectFacetValueActionCreatorPayload
) => {
  state.page = undefined;

  unsetRegularValue(
    state,
    'f',
    state.f,
    payload.facetId,
    payload.selection.value
  );

  switch (payload.selection.state) {
    case 'excluded':
      unsetRegularValue(
        state,
        'fExcluded',
        state.fExcluded,
        payload.facetId,
        payload.selection.value
      );
      break;
    case 'selected':
    case 'idle':
      state.fExcluded ??= {};
      state.fExcluded[payload.facetId] = [
        ...(state.fExcluded[payload.facetId] ?? []),
        payload.selection.value,
      ];
      break;
  }
};

const handleExcludeFacetSearchResult = (
  state: CommerceParametersState,
  action: ReturnType<typeof excludeFacetSearchResult>
) => {
  const payload = action.payload;
  state.page = undefined;

  unsetRegularValue(
    state,
    'f',
    state.f,
    payload.facetId,
    payload.value.rawValue
  );

  state.fExcluded ??= {};
  state.fExcluded[payload.facetId] = [
    ...(state.fExcluded[payload.facetId] ?? []),
    payload.value.rawValue,
  ];
};

const handleToggleSelectNumericFacetValue = (
  state: CommerceParametersState,
  payload: ToggleSelectNumericFacetValuePayload
) => {
  state.page = undefined;

  unsetRangeValue(state, 'mnf', state.mnf, payload.facetId, payload.selection);
  unsetRangeValue(
    state,
    'mnfExcluded',
    state.mnfExcluded,
    payload.facetId,
    payload.selection
  );
  unsetRangeValue(
    state,
    'nfExcluded',
    state.nfExcluded,
    payload.facetId,
    payload.selection
  );

  switch (payload.selection.state) {
    case 'selected':
      unsetRangeValue(
        state,
        'nf',
        state.nf,
        payload.facetId,
        payload.selection
      );
      break;
    case 'excluded':
    case 'idle':
      state.nf ??= {};
      state.nf[payload.facetId] = [
        ...(state.nf[payload.facetId] ?? []),
        payload.selection,
      ];
      break;
    default:
      break;
  }
};

const handleToggleExcludeNumericFacetValue = (
  state: CommerceParametersState,
  payload: ToggleExcludeNumericFacetValuePayload
) => {
  state.page = undefined;

  unsetRangeValue(state, 'mnf', state.mnf, payload.facetId, payload.selection);
  unsetRangeValue(
    state,
    'mnfExcluded',
    state.mnfExcluded,
    payload.facetId,
    payload.selection
  );
  unsetRangeValue(state, 'nf', state.nf, payload.facetId, payload.selection);

  switch (payload.selection.state) {
    case 'excluded':
      unsetRangeValue(
        state,
        'nfExcluded',
        state.nfExcluded,
        payload.facetId,
        payload.selection
      );
      break;
    case 'selected':
    case 'idle':
      state.nfExcluded ??= {};
      state.nfExcluded[payload.facetId] = [
        ...(state.nfExcluded[payload.facetId] ?? []),
        payload.selection,
      ];
      break;
    default:
      break;
  }
};

const handleUpdateManualNumericFacetRange = (
  state: CommerceParametersState,
  payload: UpdateManualNumericFacetRangePayload
) => {
  state.page = undefined;

  unsetRangeValue(state, 'nf', state.nf, payload.facetId, payload);
  unsetRangeValue(
    state,
    'nfExcluded',
    state.nfExcluded,
    payload.facetId,
    payload
  );

  const {facetId: _facetId, ...restOfPayload} = payload;

  switch (payload.state) {
    case 'idle':
      unsetRangeValue(state, 'mnf', state.mnf, payload.facetId, payload);
      unsetRangeValue(
        state,
        'mnfExcluded',
        state.mnfExcluded,
        payload.facetId,
        payload
      );
      break;
    case 'excluded':
      unsetRangeValue(state, 'mnf', state.mnf, payload.facetId, payload);
      state.mnfExcluded ??= {};
      state.mnfExcluded[payload.facetId] = [restOfPayload];
      break;
    case 'selected':
      unsetRangeValue(
        state,
        'mnfExcluded',
        state.mnfExcluded,
        payload.facetId,
        payload
      );
      state.mnf ??= {};
      state.mnf[payload.facetId] = [restOfPayload];
      break;
    default:
      break;
  }
};

const handleToggleSelectDateFacetValue = (
  state: CommerceParametersState,
  payload: ToggleSelectDateFacetValuePayload
) => {
  state.page = undefined;

  unsetRangeValue(
    state,
    'dfExcluded',
    state.dfExcluded,
    payload.facetId,
    payload.selection
  );

  const {numberOfResults: _numberOfResults, ...restOfPayload} =
    payload.selection;

  switch (payload.selection.state) {
    case 'selected':
      unsetRangeValue(
        state,
        'df',
        state.df,
        payload.facetId,
        payload.selection
      );
      break;
    case 'excluded':
    case 'idle':
      state.df ??= {};
      state.df[payload.facetId] = [
        ...(state.df[payload.facetId] ?? []),
        restOfPayload,
      ];
      break;
    default:
      break;
  }
};

const handleToggleExcludeDateFacetValue = (
  state: CommerceParametersState,
  payload: ToggleSelectDateFacetValuePayload
) => {
  state.page = undefined;

  unsetRangeValue(state, 'df', state.df, payload.facetId, payload.selection);

  const {numberOfResults: _numberOfResults, ...restOfPayload} =
    payload.selection;

  switch (payload.selection.state) {
    case 'excluded':
      unsetRangeValue(
        state,
        'dfExcluded',
        state.dfExcluded,
        payload.facetId,
        payload.selection
      );
      break;
    case 'selected':
    case 'idle':
      state.dfExcluded ??= {};
      state.dfExcluded[payload.facetId] = [
        ...(state.dfExcluded[payload.facetId] ?? []),
        restOfPayload,
      ];
      break;
    default:
      break;
  }
};

const handleToggleSelectLocationFacetValue = (
  state: CommerceParametersState,
  payload: ToggleSelectLocationFacetValuePayload
) => {
  state.page = undefined;

  switch (payload.selection.state) {
    case 'selected':
      unsetRegularValue(
        state,
        'lf',
        state.lf,
        payload.facetId,
        payload.selection.value
      );
      break;
    case 'excluded':
    case 'idle':
      state.lf ??= {};
      state.lf[payload.facetId] = [
        ...(state.lf[payload.facetId] ?? []),
        payload.selection.value,
      ];
      break;
  }
};

const unsetRegularValue = (
  state: CommerceParametersState,
  stateKey: keyof Pick<CommerceParametersState, 'f' | 'fExcluded' | 'lf'>,
  stateParameter: Record<string, string[]> | undefined,
  facetId: string,
  selection: string
) => {
  if (stateParameter !== undefined && stateParameter[facetId] !== undefined) {
    stateParameter[facetId] = stateParameter[facetId].filter(
      (value) => value !== selection
    );
    if (stateParameter[facetId].length === 0) {
      delete stateParameter[facetId];
    }
    if (Object.keys(stateParameter).length === 0) {
      state[stateKey] = undefined;
    }
  }
};

const unsetRangeValue = <T extends NumericRangeRequest | DateRangeRequest>(
  state: CommerceParametersState,
  stateKey: keyof Pick<
    CommerceParametersState,
    'nf' | 'nfExcluded' | 'mnf' | 'mnfExcluded' | 'df' | 'dfExcluded'
  >,
  stateParameter: Record<string, T[]> | undefined,
  facetId: string,
  selection: T
) => {
  if (stateParameter !== undefined && stateParameter[facetId] !== undefined) {
    const filtered = stateParameter[facetId].filter(
      (value) =>
        value.start !== selection.start ||
        value.end !== selection.end ||
        value.endInclusive !== selection.endInclusive
    );

    stateParameter[facetId] = filtered;
    if (stateParameter[facetId].length === 0) {
      delete stateParameter[facetId];
    }
    if (Object.keys(stateParameter).length === 0) {
      state[stateKey] = undefined;
    }
  }
};

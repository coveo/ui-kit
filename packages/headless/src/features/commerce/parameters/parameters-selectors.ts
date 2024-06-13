import {CommerceEngine} from '../../../app/commerce-engine/commerce-engine';
import {stateKey} from '../../../app/state-key';
import {CommerceFacetSetSection} from '../../../state/state-sections';
import {findActiveValueAncestry} from '../../facets/category-facet-set/category-facet-utils';
import {
  getFacets,
  getSortCriteria,
} from '../../parameter-manager/parameter-manager-selectors';
import {FacetType} from '../facets/facet-set/interfaces/common';
import {
  AnyFacetRequest,
  CategoryFacetRequest,
  DateFacetRequest,
  NumericFacetRequest,
  RegularFacetRequest,
} from '../facets/facet-set/interfaces/request';
import {
  CommercePaginationState,
  getCommercePaginationInitialSlice,
} from '../pagination/pagination-state';
import {getCommerceSortInitialState} from '../sort/sort-state';
import {Parameters as ManagedParameters} from './parameters-actions';

export function initialParametersSelector(
  state: CommerceEngine[typeof stateKey]
): Required<ManagedParameters> {
  return {
    page:
      state.commercePagination.principal.page ??
      getCommercePaginationInitialSlice().page,
    perPage:
      state.commercePagination.principal.perPage ??
      getCommercePaginationInitialSlice().perPage,
    sortCriteria:
      state.commerceSort.appliedSort ??
      getCommerceSortInitialState().appliedSort,
    cf: {},
    cnf: {},
    nf: {},
    df: {},
    f: {},
  };
}

export function activeParametersSelector(
  state: CommerceEngine[typeof stateKey]
): ManagedParameters {
  return {
    ...getPage(
      state?.commercePagination,
      (s) => s.principal.page,
      getCommercePaginationInitialSlice().page
    ),
    ...getPerPage(
      state?.commercePagination,
      (s) => s.principal.perPage,
      getCommercePaginationInitialSlice().perPage
    ),
    ...getSortCriteria(
      state?.commerceSort,
      (s) => s.appliedSort,
      getCommerceSortInitialState().appliedSort
    ),
    ...getFacets(
      state.commerceFacetSet,
      facetIsOfType(state, 'regular'),
      getSelectedValues,
      'f'
    ),
    ...getFacets(
      state.commerceFacetSet,
      facetIsOfType(state, 'hierarchical'),
      getSelectedCategoryValues,
      'cf'
    ),
    ...getFacets(
      state.commerceFacetSet,
      facetIsOfType(state, 'dateRange'),
      getSelectedRangeValues,
      'df'
    ),
    ...getFacets(
      state.commerceFacetSet,
      facetIsOfType(state, 'numericalRange'),
      getSelectedRangeValues,
      'nf'
    ),
    ...getFacets(
      state.commerceFacetSet,
      facetIsOfType(state, 'numericalRange'),
      getCustomRangeValues,
      'cnf'
    ),
  };
}

export function enrichedParametersSelector(
  state: CommerceEngine[typeof stateKey],
  activeParams: ManagedParameters
) {
  return {
    ...initialParametersSelector(state),
    ...activeParams,
  };
}

export function getPage(
  section: CommercePaginationState | undefined,
  pageSelector: (section: CommercePaginationState) => number,
  initialState: number
) {
  if (section === undefined) {
    return {};
  }

  const page = pageSelector(section);
  const shouldInclude = page !== initialState;
  return shouldInclude ? {page} : {};
}

export function getPerPage(
  section: CommercePaginationState | undefined,
  perPageSelector: (section: CommercePaginationState) => number,
  initialState: number
) {
  if (section === undefined) {
    return {};
  }

  const perPage = perPageSelector(section);
  const shouldInclude = perPage !== initialState;
  return shouldInclude ? {perPage} : {};
}

export function getSelectedValues(request: AnyFacetRequest) {
  return (request as RegularFacetRequest).values
    .filter((fv) => fv.state === 'selected')
    .map((fv) => fv.value);
}

export function getSelectedRangeValues(request: AnyFacetRequest) {
  return (request as NumericFacetRequest | DateFacetRequest).values.filter(
    (fv) => fv.state === 'selected' && fv.isCustomRange !== true
  );
}

export function getCustomRangeValues(request: AnyFacetRequest) {
  return (request as NumericFacetRequest | DateFacetRequest).values.filter(
    (fv) => fv.state === 'selected' && fv.isCustomRange === true
  );
}

export function getSelectedCategoryValues(request: AnyFacetRequest): string[] {
  const categoryRequest = request as CategoryFacetRequest;
  return findActiveValueAncestry(
    categoryRequest.values as Parameters<typeof findActiveValueAncestry>[0]
  ).map((v) => v.value);
}

function facetIsOfType(
  state: Partial<CommerceFacetSetSection>,
  type: FacetType
) {
  return (facetId: string) => {
    return state.commerceFacetSet![facetId].request.type === type;
  };
}

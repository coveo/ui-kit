import {CommerceEngine} from '../../../app/commerce-engine/commerce-engine';
import {stateKey} from '../../../app/state-key';
import {Parameters as ManagedParameters} from './parameters-actions';
import {getFacets} from '../../parameter-manager/parameter-manager-selectors';
import {
  AnyFacetRequest, CategoryFacetRequest,
  DateFacetRequest,
  NumericFacetRequest,
  RegularFacetRequest
} from '../facets/facet-set/interfaces/request';
import {findActiveValueAncestry} from '../../facets/category-facet-set/category-facet-utils';
import {CommerceFacetSetSection} from '../../../state/state-sections';
import {FacetType} from '../facets/facet-set/interfaces/common';
import {getCommercePaginationInitialSlice} from '../pagination/pagination-state';
import {getCommerceSortInitialState} from '../sort/sort-state';

export function initialParametersSelector(
  state: CommerceEngine[typeof stateKey]
): Required<ManagedParameters> {
  return {
    page: state.commercePagination.principal.page ?? getCommercePaginationInitialSlice().page,
    perPage: state.commercePagination.principal.perPage ?? getCommercePaginationInitialSlice().perPage,
    cf: {},
    sortCriteria: state.commerceSort.appliedSort ?? getCommerceSortInitialState().appliedSort,
    nf: {},
    df: {},
    f: {},
  }
}

export function activeParametersSelector(
  state: CommerceEngine[typeof stateKey]
): ManagedParameters {
  return {
    // TODO(nico): Support sort
    // TODO(nico): Support pagination
    //...getSortCriteria(state?.commerceSort, (s) => s.appliedSort, getCommerceSortInitialState().appliedSort),
    ...getFacets(state?.commerceFacetSet, facetIsOfType(state, 'regular'), getSelectedValues, 'f'),
    ...getFacets(state?.commerceFacetSet, facetIsOfType(state, 'hierarchical'), getSelectedCategoryValues, 'cf'),
    ...getFacets(state?.commerceFacetSet, facetIsOfType(state, 'dateRange'), getSelectedRangeValues, 'df'),
    ...getFacets(state?.commerceFacetSet, facetIsOfType(state, 'numericalRange'), getSelectedRangeValues, 'nf'),
  };
}

export function getSelectedValues(request: AnyFacetRequest) {
  return (request as RegularFacetRequest).values.filter((fv) => fv.state === 'selected').map((fv) => fv.value);
}

export function getSelectedRangeValues(request: AnyFacetRequest) {
  return (request as NumericFacetRequest | DateFacetRequest).values.filter((fv) => fv.state === 'selected');
}

export function getSelectedCategoryValues(request: AnyFacetRequest): string[] {
  const categoryRequest = request as CategoryFacetRequest;
  return findActiveValueAncestry(categoryRequest.values as Parameters<typeof findActiveValueAncestry>[0]).map(v => v.value)
}

function facetIsOfType(state: Partial<CommerceFacetSetSection>, type: FacetType) {
  return (facetId: string) => {
    return state.commerceFacetSet![facetId].request.type === type;
  }
}
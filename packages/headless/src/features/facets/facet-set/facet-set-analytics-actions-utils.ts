import {FacetStateMetadata} from 'coveo.analytics/dist/definitions/searchPage/searchPageEvents';
import {SearchAppState} from '../../../state/search-app-state';
import {
  CategoryFacetSection,
  DateFacetSection,
  FacetSection,
  NumericFacetSection,
  SearchSection,
} from '../../../state/state-sections';
import {getSearchInitialState} from '../../search/search-state';
import {categoryFacetResponseSelector} from '../category-facet-set/category-facet-set-selectors';
import {getCategoryFacetSetInitialState} from '../category-facet-set/category-facet-set-state';
import {CategoryFacetValue} from '../category-facet-set/interfaces/response';
import {AvailableType} from '../facet-api/request';
import {
  AnyFacetResponse,
  AnyFacetValue,
} from '../generic/interfaces/generic-facet-response';
import {dateFacetResponseSelector} from '../range-facets/date-facet-set/date-facet-selectors';
import {getDateFacetSetInitialState} from '../range-facets/date-facet-set/date-facet-set-state';
import {DateFacetValue} from '../range-facets/date-facet-set/interfaces/response';
import {RangeFacetSortCriterion} from '../range-facets/generic/interfaces/request';
import {NumericFacetValue} from '../range-facets/numeric-facet-set/interfaces/response';
import {numericFacetResponseSelector} from '../range-facets/numeric-facet-set/numeric-facet-selectors';
import {getNumericFacetSetInitialState} from '../range-facets/numeric-facet-set/numeric-facet-set-state';
import {facetResponseSelector} from './facet-set-selectors';
import {getFacetSetInitialState} from './facet-set-state';
import {FacetSortCriterion} from './interfaces/request';
import {FacetValue} from './interfaces/response';

export type SectionNeededForFacetMetadata = FacetSection &
  CategoryFacetSection &
  DateFacetSection &
  NumericFacetSection &
  SearchSection;

export type FacetUpdateSortMetadata = {
  facetId: string;
  criterion: FacetSortCriterion | RangeFacetSortCriterion;
};

export type FacetSelectionChangeMetadata = {
  facetId: string;
  facetValue: string;
};

export const buildFacetBaseMetadata = (
  facetId: string,
  state: SectionNeededForFacetMetadata
) => {
  const facet =
    state.facetSet[facetId] ||
    state.categoryFacetSet[facetId] ||
    state.dateFacetSet[facetId] ||
    state.numericFacetSet[facetId];

  const facetField = facet.field;
  const facetTitle = `${facetField}_${facetId}`;

  return {facetId, facetField, facetTitle};
};

export function buildFacetSelectionChangeMetadata(
  payload: FacetSelectionChangeMetadata,
  state: SectionNeededForFacetMetadata
) {
  const {facetId, facetValue} = payload;
  const base = buildFacetBaseMetadata(facetId, state);

  return {...base, facetValue};
}

export function getStateNeededForFacetMetadata(
  s: Partial<SearchAppState>
): SectionNeededForFacetMetadata {
  return {
    facetSet: s.facetSet || getFacetSetInitialState(),
    categoryFacetSet: s.categoryFacetSet || getCategoryFacetSetInitialState(),
    dateFacetSet: s.dateFacetSet || getDateFacetSetInitialState(),
    numericFacetSet: s.numericFacetSet || getNumericFacetSetInitialState(),
    search: s.search || getSearchInitialState(),
  };
}

export const buildFacetStateMetadata = (
  state: SectionNeededForFacetMetadata
) => {
  const facetState: FacetStateMetadata[] = [];

  state.search.response.facets.forEach((facetResponse, facetPosition) => {
    (facetResponse.values as Array<AnyFacetValue>).forEach(
      (facetValue, facetValuePositition) => {
        if (facetValue.state === 'selected') {
          const facetType = getFacetType(state, facetResponse.facetId);

          const facetResponseAnalytics = mapFacetResponseToAnalytics(
            facetResponse,
            facetPosition + 1
          );

          const facetValueAnalytics = mapFacetValueToAnalytics(
            facetValue,
            facetValuePositition + 1,
            facetType
          );

          const facetDisplayValueAnalytics =
            facetType === 'hierarchical' || facetType === 'specific'
              ? mapFacetDisplayValueToAnalytics(
                  facetValue as CategoryFacetValue | FacetValue
                )
              : mapRangeDisplayFacetValueToAnalytics(
                  facetValue as NumericFacetValue | DateFacetValue
                );

          facetState.push({
            ...facetResponseAnalytics,
            ...facetValueAnalytics,
            ...facetDisplayValueAnalytics,
          });
        }
      }
    );
  });

  return facetState;
};

const mapFacetValueToAnalytics = (
  facetValue: AnyFacetValue,
  valuePosition: number,
  facetType: AvailableType
) => {
  return {
    state: facetValue.state,
    valuePosition,
    facetType,
  };
};

const mapRangeDisplayFacetValueToAnalytics = (
  facetValue: DateFacetValue | NumericFacetValue
) => {
  return {
    displayValue: `${facetValue.start}..${facetValue.end}`,
    value: `${facetValue.start}..${facetValue.end}`,
    start: facetValue.start,
    end: facetValue.end,
    endInclusive: facetValue.endInclusive,
  };
};

const mapFacetDisplayValueToAnalytics = (
  facetValue: CategoryFacetValue | FacetValue
) => {
  return {
    displayValue: facetValue.value,
    value: facetValue.value,
  };
};

const mapFacetResponseToAnalytics = (
  response: AnyFacetResponse,
  facetPosition: number
) => {
  return {
    title: response.facetId,
    field: response.field,
    id: response.facetId,
    facetPosition,
  };
};

const getFacetType = (
  state: SearchSection &
    FacetSection &
    CategoryFacetSection &
    DateFacetSection &
    NumericFacetSection,
  id: string
): AvailableType => {
  const facetResponse = facetResponseSelector(state, id);
  if (facetResponse) {
    return 'specific';
  }
  const categoryFacetResponse = categoryFacetResponseSelector(state, id);
  if (categoryFacetResponse) {
    return 'hierarchical';
  }
  const dateFacetResponse = dateFacetResponseSelector(state, id);
  if (dateFacetResponse) {
    return 'dateRange';
  }
  const numericFacetResponse = numericFacetResponseSelector(state, id);
  if (numericFacetResponse) {
    return 'numericalRange';
  }

  return 'specific';
};

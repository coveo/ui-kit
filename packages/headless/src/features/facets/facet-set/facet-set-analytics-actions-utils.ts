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
import {getCategoryFacetSetInitialState} from '../category-facet-set/category-facet-set-state';
import {CategoryFacetRequest} from '../category-facet-set/interfaces/request';
import {CategoryFacetValue} from '../category-facet-set/interfaces/response';
import {FacetType} from '../facet-api/request';
import {
  AnyFacetResponse,
  AnyFacetValue,
} from '../generic/interfaces/generic-facet-response';
import {getDateFacetSetInitialState} from '../range-facets/date-facet-set/date-facet-set-state';
import {DateFacetRequest} from '../range-facets/date-facet-set/interfaces/request';
import {DateFacetValue} from '../range-facets/date-facet-set/interfaces/response';
import {RangeFacetSortCriterion} from '../range-facets/generic/interfaces/request';
import {NumericFacetRequest} from '../range-facets/numeric-facet-set/interfaces/request';
import {NumericFacetValue} from '../range-facets/numeric-facet-set/interfaces/response';
import {getNumericFacetSetInitialState} from '../range-facets/numeric-facet-set/numeric-facet-set-state';
import {getFacetSetInitialState} from './facet-set-state';
import {FacetRequest, FacetSortCriterion} from './interfaces/request';
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
  const facet = getFacet(state, facetId);

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
  facetType: FacetType
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

const getFacet = (
  state: SectionNeededForFacetMetadata,
  facetId: string
):
  | FacetRequest
  | CategoryFacetRequest
  | DateFacetRequest
  | NumericFacetRequest => {
  return (
    state.facetSet[facetId] ||
    state.categoryFacetSet[facetId] ||
    state.dateFacetSet[facetId] ||
    state.numericFacetSet[facetId]
  );
};

const getFacetType = (
  state: SectionNeededForFacetMetadata,
  facetId: string
) => {
  const facet = getFacet(state, facetId);
  return facet ? facet.type : 'specific';
};

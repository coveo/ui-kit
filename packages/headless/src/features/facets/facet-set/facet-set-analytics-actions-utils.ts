import {FacetStateMetadata} from 'coveo.analytics/dist/definitions/searchPage/searchPageEvents';
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
import {FacetType} from '../facet-api/request';
import {
  AnyFacetResponse,
  AnyFacetValue,
} from '../generic/interfaces/generic-facet-response';
import {getDateFacetSetInitialState} from '../range-facets/date-facet-set/date-facet-set-state';
import {DateFacetRequest} from '../range-facets/date-facet-set/interfaces/request';
import {DateFacetValue} from '../range-facets/date-facet-set/interfaces/response';
import {NumericFacetRequest} from '../range-facets/numeric-facet-set/interfaces/request';
import {NumericFacetValue} from '../range-facets/numeric-facet-set/interfaces/response';
import {getNumericFacetSetInitialState} from '../range-facets/numeric-facet-set/numeric-facet-set-state';
import {getFacetSetInitialState} from './facet-set-state';
import {FacetRequest} from './interfaces/request';
import {FacetValue} from './interfaces/response';
import {categoryFacetSelectedValuesSelector} from '../category-facet-set/category-facet-set-selectors';

export type SectionNeededForFacetMetadata = FacetSection &
  CategoryFacetSection &
  DateFacetSection &
  NumericFacetSection &
  SearchSection;

export type FacetSelectionChangeMetadata = {
  facetId: string;
  facetValue: string;
};

export const buildFacetBaseMetadata = (
  facetId: string,
  state: SectionNeededForFacetMetadata
) => {
  const facet = getFacet(state, facetId);

  const facetField = facet ? facet.field : '';
  const facetTitle = `${facetField}_${facetId}`;

  return {facetId, facetField, facetTitle};
};

export function buildFacetSelectionChangeMetadata(
  payload: FacetSelectionChangeMetadata,
  state: SectionNeededForFacetMetadata
) {
  const {facetId, facetValue} = payload;
  const base = buildFacetBaseMetadata(facetId, state);
  const facetType = getFacetType(state, facetId);
  return {
    ...base,
    facetValue:
      facetType === 'hierarchical'
        ? getCategoryFacetSelectedValue(state, facetId)
        : facetValue,
  };
}

export function getStateNeededForFacetMetadata(
  s: Partial<SectionNeededForFacetMetadata>
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

  state.search.response.facets.forEach((facetResponse, facetIndex) => {
    const facetType = getFacetType(state, facetResponse.facetId);
    const facetResponseAnalytics = mapFacetResponseToAnalytics(
      facetResponse,
      facetIndex + 1
    );

    if (facetType === 'hierarchical') {
      const hasSelectedValue = !!categoryFacetSelectedValuesSelector(
        state,
        facetResponse.facetId
      ).length;

      if (!hasSelectedValue) {
        return;
      }

      facetState.push({
        ...facetResponseAnalytics,
        ...mapCategoryFacetValueToAnalytics(state, facetResponse.facetId),
        facetType,
        state: 'selected',
      });

      return;
    }

    (facetResponse.values as Array<AnyFacetValue>).forEach(
      (facetValue, facetValueIndex) => {
        if (facetValue.state === 'idle') {
          return;
        }

        const facetValueAnalytics = mapFacetValueToAnalytics(
          facetValue,
          facetValueIndex + 1,
          facetType
        );

        const facetDisplayValueAnalytics =
          facetType === 'specific'
            ? mapFacetDisplayValueToAnalytics(facetValue as FacetValue)
            : mapRangeDisplayFacetValueToAnalytics(
                facetValue as NumericFacetValue | DateFacetValue
              );

        facetState.push({
          ...facetResponseAnalytics,
          ...facetValueAnalytics,
          ...facetDisplayValueAnalytics,
        });
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

const mapFacetDisplayValueToAnalytics = (facetValue: FacetValue) => {
  return {
    displayValue: facetValue.value,
    value: facetValue.value,
  };
};

const getCategoryFacetSelectedValue = (
  state: SectionNeededForFacetMetadata,
  facetId: string
) => {
  const selectedCategoryFacetValues = categoryFacetSelectedValuesSelector(
    state,
    facetId
  );
  return selectedCategoryFacetValues
    .map((selectedCategoryFacetValue) => selectedCategoryFacetValue.value)
    .join(';');
};

const mapCategoryFacetValueToAnalytics = (
  state: SectionNeededForFacetMetadata,
  facetId: string
) => {
  const valuePosition = 1;
  const value = getCategoryFacetSelectedValue(state, facetId);
  return {
    value,
    valuePosition,
    displayValue: value,
  };
};

const mapFacetResponseToAnalytics = (
  response: AnyFacetResponse,
  facetPosition: number
) => {
  return {
    title: `${response.field}_${response.facetId}`,
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
  | NumericFacetRequest
  | undefined => {
  return (
    state.facetSet[facetId] ||
    state.categoryFacetSet[facetId]?.request ||
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

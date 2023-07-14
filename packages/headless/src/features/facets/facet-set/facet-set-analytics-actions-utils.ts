import {FacetStateMetadata} from 'coveo.analytics/dist/definitions/searchPage/searchPageEvents';
import {
  AutomaticFacetSection,
  CategoryFacetSection,
  DateFacetSection,
  FacetSection,
  NumericFacetSection,
} from '../../../state/state-sections';
import {getAutomaticFacetSetInitialState} from '../automatic-facet-set/automatic-facet-set-state';
import {AutomaticFacetResponse} from '../automatic-facet-set/interfaces/response';
import {categoryFacetRequestActiveValuesSelector} from '../category-facet-set/category-facet-set-selectors';
import {getCategoryFacetSetInitialState} from '../category-facet-set/category-facet-set-state';
import {CategoryFacetRequest} from '../category-facet-set/interfaces/request';
import {FacetType} from '../facet-api/request';
import {
  AnyFacetRequest,
  AnyFacetValueRequest,
} from '../generic/interfaces/generic-facet-request';
import {getDateFacetSetInitialState} from '../range-facets/date-facet-set/date-facet-set-state';
import {
  DateFacetRequest,
  DateRangeRequest,
} from '../range-facets/date-facet-set/interfaces/request';
import {
  NumericFacetRequest,
  NumericRangeRequest,
} from '../range-facets/numeric-facet-set/interfaces/request';
import {getNumericFacetSetInitialState} from '../range-facets/numeric-facet-set/numeric-facet-set-state';
import {getFacetSetInitialState} from './facet-set-state';
import {FacetRequest, FacetValueRequest} from './interfaces/request';

export type SectionNeededForFacetMetadata = FacetSection &
  CategoryFacetSection &
  DateFacetSection &
  NumericFacetSection &
  AutomaticFacetSection;

export type FacetSelectionChangeMetadata = {
  facetId: string;
  facetValue: string;
};

export const buildFacetBaseMetadata = (
  facetId: string,
  state: SectionNeededForFacetMetadata
) => {
  const facet = getFacetRequest(state, facetId);

  const facetField = facet ? facet.field : '';
  const facetTitle = getFacetTitle(facetField, facetId);

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
        ? getCategoryFacetActiveValue(state, facetId)
        : facetValue,
  };
}

export function getStateNeededForFacetMetadata(
  s: Partial<SectionNeededForFacetMetadata>
): SectionNeededForFacetMetadata {
  return {
    facetSet: s.facetSet ?? getFacetSetInitialState(),
    categoryFacetSet: s.categoryFacetSet ?? getCategoryFacetSetInitialState(),
    dateFacetSet: s.dateFacetSet ?? getDateFacetSetInitialState(),
    numericFacetSet: s.numericFacetSet ?? getNumericFacetSetInitialState(),
    automaticFacetSet:
      s.automaticFacetSet ?? getAutomaticFacetSetInitialState(),
  };
}

export const buildFacetStateMetadata = (
  state: SectionNeededForFacetMetadata
) => {
  const facetState: FacetStateMetadata[] = [];

  getFacetRequests(state).forEach((facetRequest, facetIndex) => {
    const facetType = getFacetType(state, facetRequest.facetId);
    const facetRequestAnalytics = mapFacetRequestToAnalytics(
      facetRequest,
      facetIndex + 1
    );

    if (isCategoryFacetRequest(facetRequest)) {
      const activeValues = categoryFacetRequestActiveValuesSelector(
        state,
        facetRequest.facetId
      );

      if (!activeValues.length) {
        return;
      }

      const lowestLeaf = activeValues[activeValues.length - 1];

      facetState.push({
        ...facetRequestAnalytics,
        ...mapCategoryFacetValueToAnalytics(state, facetRequest.facetId),
        facetType,
        state: lowestLeaf.state,
      });

      return;
    }

    facetRequest.currentValues.forEach((facetValue, facetValueIndex) => {
      if (facetValue.state === 'idle') {
        return;
      }

      const facetValueAnalytics = mapFacetValueToAnalytics(
        facetValue,
        facetValueIndex + 1,
        facetType
      );

      const facetDisplayValueAnalytics = isSpecificFacetRequest(facetRequest)
        ? mapFacetDisplayValueToAnalytics(facetValue as FacetValueRequest)
        : mapRangeDisplayFacetValueToAnalytics(
            facetValue as NumericRangeRequest | DateRangeRequest
          );

      facetState.push({
        ...facetRequestAnalytics,
        ...facetValueAnalytics,
        ...facetDisplayValueAnalytics,
      });
    });
  });

  getAutomaticFacets(state).forEach((facet, facetIndex) => {
    const facetAnalytics = mapAutomaticFacetToAnalytics(facet, facetIndex + 1);

    facet.values.forEach((facetValue, facetValueIndex) => {
      if (facetValue.state === 'idle') {
        return;
      }

      const facetValueAnalytics = mapFacetValueToAnalytics(
        facetValue,
        facetValueIndex + 1,
        'specific'
      );

      const facetDisplayValueAnalytics =
        mapFacetDisplayValueToAnalytics(facetValue);

      facetState.push({
        ...facetAnalytics,
        ...facetValueAnalytics,
        ...facetDisplayValueAnalytics,
      });
    });
  });

  return facetState;
};

const isSpecificFacetRequest = (
  request: AnyFacetRequest
): request is FacetRequest => request.type === 'specific';

const isCategoryFacetRequest = (
  request: AnyFacetRequest
): request is CategoryFacetRequest => request.type === 'hierarchical';

const getFacetRequests = (state: SectionNeededForFacetMetadata) => {
  return [
    ...Object.values(state.facetSet),
    ...Object.values(state.categoryFacetSet),
    ...Object.values(state.dateFacetSet),
    ...Object.values(state.numericFacetSet),
  ].map((facet) => facet.request);
};

const getAutomaticFacets = (
  state: SectionNeededForFacetMetadata
): AutomaticFacetResponse[] => {
  return [...Object.values(state.automaticFacetSet.facets)];
};

const mapFacetValueToAnalytics = (
  facetValue: AnyFacetValueRequest,
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
  facetValue: NumericRangeRequest | DateRangeRequest
) => {
  return {
    displayValue: `${facetValue.start}..${facetValue.end}`,
    value: `${facetValue.start}..${facetValue.end}`,
    start: facetValue.start,
    end: facetValue.end,
    endInclusive: facetValue.endInclusive,
  };
};

const mapFacetDisplayValueToAnalytics = (facetValue: FacetValueRequest) => {
  return {
    displayValue: facetValue.value,
    value: facetValue.value,
  };
};

const getCategoryFacetActiveValue = (
  state: SectionNeededForFacetMetadata,
  facetId: string
) => {
  const activeCategoryFacetValues = categoryFacetRequestActiveValuesSelector(
    state,
    facetId
  );
  return activeCategoryFacetValues
    .map((activeCategoryFacetValue) => activeCategoryFacetValue.value)
    .join(';');
};

const mapCategoryFacetValueToAnalytics = (
  state: SectionNeededForFacetMetadata,
  facetId: string
) => {
  const valuePosition = 1;
  const value = getCategoryFacetActiveValue(state, facetId);
  return {
    value,
    valuePosition,
    displayValue: value,
  };
};

const mapAutomaticFacetToAnalytics = (
  facet: AutomaticFacetResponse,
  facetPosition: number
) => {
  return {
    title: getFacetTitle(facet.field, facet.field),
    field: facet.field,
    id: facet.field,
    facetPosition,
  };
};

const mapFacetRequestToAnalytics = (
  request: AnyFacetRequest,
  facetPosition: number
) => {
  return {
    title: getFacetTitle(request.field, request.facetId),
    field: request.field,
    id: request.facetId,
    facetPosition,
  };
};

const getFacetTitle = (field: string, facetId: string) => {
  return `${field}_${facetId}`;
};

const getFacetRequest = (
  state: SectionNeededForFacetMetadata,
  facetId: string
):
  | FacetRequest
  | CategoryFacetRequest
  | DateFacetRequest
  | NumericFacetRequest
  | undefined => {
  return (
    state.facetSet[facetId]?.request ||
    state.categoryFacetSet[facetId]?.request ||
    state.dateFacetSet[facetId]?.request ||
    state.numericFacetSet[facetId]?.request ||
    state.automaticFacetSet.facets[facetId]
  );
};

const getFacetType = (
  state: SectionNeededForFacetMetadata,
  facetId: string
) => {
  const facet = getFacetRequest(state, facetId);
  return facet ? facet.type : 'specific';
};

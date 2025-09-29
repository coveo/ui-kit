import type {EventDescription} from 'coveo.analytics';
import type {NavigatorContext} from '../../app/navigator-context-provider.js';
import type {SearchAppState} from '../../state/search-app-state.js';
import type {ConfigurationSection} from '../../state/state-sections.js';
import {sortCriteriaMap, sortFacets} from '../../utils/facet-utils.js';
import type {AutomaticFacetRequest} from '../facets/automatic-facet-set/interfaces/request.js';
import type {AutomaticFacetResponse} from '../facets/automatic-facet-set/interfaces/response.js';
import type {FacetSetState} from '../facets/facet-set/facet-set-state.js';
import {
  type AnyFacetRequest,
  getFacetRequests,
} from '../facets/generic/interfaces/generic-facet-request.js';
import type {RangeFacetSetState} from '../facets/range-facets/generic/interfaces/range-facet.js';
import {maximumNumberOfResultsFromIndex} from '../pagination/pagination-constants.js';
import {buildSearchAndFoldingLoadCollectionRequest as legacyBuildSearchAndFoldingLoadCollectionRequest} from '../search-and-folding/legacy/search-and-folding-request.js';
import {buildSearchAndFoldingLoadCollectionRequest} from '../search-and-folding/search-and-folding-request.js';
import {selectStaticFilterExpressions} from '../static-filter-set/static-filter-set-selectors.js';
import {mapSearchRequest} from './search-mappings.js';

type StateNeededBySearchRequest = ConfigurationSection &
  Partial<SearchAppState>;

export const buildSearchRequest = async (
  state: StateNeededBySearchRequest,
  navigatorContext: NavigatorContext,
  eventDescription?: EventDescription
) => {
  const cq = buildConstantQuery(state);
  const facets = getFacets(state);
  const automaticFacets = getAutomaticFacets(state);
  const sharedWithFoldingRequest =
    state.configuration.analytics.analyticsMode === 'legacy'
      ? await legacyBuildSearchAndFoldingLoadCollectionRequest(
          state,
          eventDescription
        )
      : buildSearchAndFoldingLoadCollectionRequest(
          state,
          navigatorContext,
          eventDescription
        );

  return mapSearchRequest({
    ...sharedWithFoldingRequest,
    ...(state.didYouMean && {
      queryCorrection: {
        enabled:
          state.didYouMean.enableDidYouMean &&
          state.didYouMean.queryCorrectionMode === 'next',
        options: {
          automaticallyCorrect: state.didYouMean.automaticallyCorrectQuery
            ? ('whenNoResults' as const)
            : ('never' as const),
        },
      },
      enableDidYouMean:
        state.didYouMean.enableDidYouMean &&
        state.didYouMean.queryCorrectionMode === 'legacy',
    }),
    ...(cq && {cq}),
    ...(facets.length && {facets}),
    ...(state.pagination && {
      numberOfResults: getNumberOfResultsWithinIndexLimit(state),
      firstResult: state.pagination.firstResult,
    }),
    ...(state.facetOptions && {
      facetOptions: {freezeFacetOrder: state.facetOptions.freezeFacetOrder},
    }),
    ...(state.folding?.enabled && {
      filterField: state.folding.fields.collection,
      childField: state.folding.fields.parent,
      parentField: state.folding.fields.child,
      filterFieldRange: state.folding.filterFieldRange,
    }),
    ...(state.automaticFacetSet && {
      generateAutomaticFacets: {
        desiredCount: state.automaticFacetSet.desiredCount,
        numberOfValues: state.automaticFacetSet.numberOfValues,
        currentFacets: automaticFacets,
      },
    }),
    ...(state.generatedAnswer && {
      pipelineRuleParameters: {
        mlGenerativeQuestionAnswering: {
          responseFormat: state.generatedAnswer.responseFormat,
          citationsFieldToInclude:
            state.generatedAnswer.fieldsToIncludeInCitations,
        },
      },
    }),
  });
};

// Corner case:
// If the number of results requested would go over the index limit (maximumNumberOfResultsFromIndex)
// we need to request fewer results in order to ensure we do not receive an exception from the index
export function getNumberOfResultsWithinIndexLimit(
  state: StateNeededBySearchRequest
) {
  if (!state.pagination) {
    return undefined;
  }

  const isOverIndexLimit =
    state.pagination.firstResult + state.pagination.numberOfResults >
    maximumNumberOfResultsFromIndex;

  if (isOverIndexLimit) {
    return maximumNumberOfResultsFromIndex - state.pagination.firstResult;
  }
  return state.pagination.numberOfResults;
}

function getFacets(state: StateNeededBySearchRequest) {
  return sortFacets(getAllEnabledFacets(state), state.facetOrder ?? []);
}

function getAutomaticFacets(state: StateNeededBySearchRequest) {
  const facets = state.automaticFacetSet?.set;

  return facets
    ? Object.values(facets)
        .map((facet) => facet.response)
        .map(responseToAutomaticFacetRequest)
        .filter((facetRequest) => facetRequest.currentValues.length > 0)
    : undefined;
}
function responseToAutomaticFacetRequest(
  response: AutomaticFacetResponse
): AutomaticFacetRequest {
  const {field, label, values} = response;

  const selectedValues = values.filter((value) => value.state === 'selected');
  return {
    field,
    label,
    currentValues: selectedValues,
  };
}
function getAllEnabledFacets(state: StateNeededBySearchRequest) {
  return getAllFacets(state).filter(
    ({facetId}) => state.facetOptions?.facets[facetId]?.enabled ?? true
  );
}

function getAllFacets(state: StateNeededBySearchRequest) {
  return [
    ...getSpecificFacetRequests(state.facetSet ?? {}),
    ...getRangeFacetRequests(state.numericFacetSet ?? {}),
    ...getRangeFacetRequests(state.dateFacetSet ?? {}),
    ...getFacetRequests(state.categoryFacetSet ?? {}),
  ];
}

function getSpecificFacetRequests<T extends FacetSetState>(state: T) {
  return getFacetRequests(state).map((request) => {
    /* The Search API does not support 'alphanumericDescending' as a string value and instead relies on a new sort mechanism to specify sort order.
    At the moment, this is only supported for alphanumeric sorting, but will likely transition to this pattern for other types in the future. */
    const sortCriteria =
      sortCriteriaMap[request.sortCriteria as keyof typeof sortCriteriaMap];
    if (sortCriteria) {
      return {
        ...request,
        sortCriteria,
      };
    }
    return request;
  });
}

function getRangeFacetRequests<T extends RangeFacetSetState>(state: T) {
  return getFacetRequests(state).map((request) => {
    const currentValues =
      request.currentValues as AnyFacetRequest['currentValues'];
    const hasActiveValues = currentValues.some(({state}) => state !== 'idle');
    const hasPreviousStateValues = currentValues.some(
      (value) => value.previousState
    );

    if (
      request.generateAutomaticRanges &&
      !hasActiveValues &&
      !hasPreviousStateValues
    ) {
      return {...request, currentValues: []};
    }

    return request;
  });
}

export function buildConstantQuery(state: StateNeededBySearchRequest) {
  const cq = state.advancedSearchQueries?.cq.trim() || '';
  const activeTab = Object.values(state.tabSet || {}).find(
    (tab) => tab.isActive
  );
  const tabExpression = activeTab?.expression.trim() || '';
  const filterExpressions = selectStaticFilterExpressions(state);

  return [cq, tabExpression, ...filterExpressions]
    .filter((expression) => !!expression)
    .join(' AND ');
}

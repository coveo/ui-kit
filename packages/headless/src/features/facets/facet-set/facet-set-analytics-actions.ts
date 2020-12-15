import {FacetSortCriterion} from './interfaces/request';
import {RangeFacetSortCriterion} from '../range-facets/generic/interfaces/request';
import {validatePayload} from '../../../utils/validate-payload';
import {
  facetIdDefinition,
  requiredNonEmptyString,
} from '../generic/facet-actions-validation';
import {SearchAppState} from '../../../state/search-app-state';
import {getFacetSetInitialState} from './facet-set-state';
import {getDateFacetSetInitialState} from '../range-facets/date-facet-set/date-facet-set-state';
import {getNumericFacetSetInitialState} from '../range-facets/numeric-facet-set/numeric-facet-set-state';
import {getCategoryFacetSetInitialState} from '../category-facet-set/category-facet-set-state';
import {Value} from '@coveo/bueno';
import {
  AnalyticsType,
  makeAnalyticsAction,
} from '../../analytics/analytics-utils';
import {
  FacetSelectionChangeMetadata,
  FacetUpdateSortMetadata,
  SectionNeededForFacetMetadata,
} from './facet-set-analytics-actions-utils';

/**
 * Logs a facet show more event.
 * @param facetId (string) The unique identifier of the facet (e.g., `"1"`).
 */
export const logFacetShowMore = (facetId: string) =>
  makeAnalyticsAction(
    'analytics/facet/showMore',
    AnalyticsType.Search,
    (client, state) => {
      validatePayload(facetId, facetIdDefinition);
      const metadata = buildFacetBaseMetadata(
        facetId,
        getStateNeededForFacetMetadata(state)
      );
      return client.logFacetShowMore(metadata);
    }
  )();
/**
 * Logs a facet show less event.
 * @param facetId (string) The unique identifier of the facet (e.g., `"1"`).
 */
export const logFacetShowLess = (facetId: string) =>
  makeAnalyticsAction(
    'analytics/facet/showLess',
    AnalyticsType.Search,
    (client, state) => {
      validatePayload(facetId, facetIdDefinition);
      const metadata = buildFacetBaseMetadata(
        facetId,
        getStateNeededForFacetMetadata(state)
      );

      return client.logFacetShowLess(metadata);
    }
  )();

/**
 * Logs a facet search event.
 * @param facetId (string) The unique identifier of the facet (e.g., `"1"`).
 */
export const logFacetSearch = (facetId: string) =>
  makeAnalyticsAction(
    'analytics/facet/search',
    AnalyticsType.Search,
    (client, state) => {
      validatePayload(facetId, facetIdDefinition);
      const metadata = buildFacetBaseMetadata(
        facetId,
        getStateNeededForFacetMetadata(state)
      );
      return client.logFacetSearch(metadata, []);
    }
  )();
/**
 * Logs a facet sort event.
 * @param payload (FacetUpdateSortMetadata) Object specifying the facet and sort criterion.
 */
export const logFacetUpdateSort = (payload: FacetUpdateSortMetadata) =>
  makeAnalyticsAction(
    'analytics/facet/sortChange',
    AnalyticsType.Search,
    (client, state) => {
      validatePayload(payload, {
        facetId: facetIdDefinition,
        criterion: new Value<FacetSortCriterion | RangeFacetSortCriterion>({
          required: true,
        }),
      });
      const {facetId, criterion} = payload;

      const base = buildFacetBaseMetadata(
        facetId,
        getStateNeededForFacetMetadata(state)
      );
      const metadata = {...base, criteria: criterion};

      return client.logFacetUpdateSort(metadata, []);
    }
  )();

/**
 * Logs a facet clear all event.
 * @param facetId (string) The unique identifier of the facet (e.g., `"1"`).
 */
export const logFacetClearAll = (facetId: string) =>
  makeAnalyticsAction(
    'analytics/facet/reset',
    AnalyticsType.Search,
    (client, state) => {
      validatePayload(facetId, facetIdDefinition);
      const metadata = buildFacetBaseMetadata(
        facetId,
        getStateNeededForFacetMetadata(state)
      );
      return client.logFacetClearAll(metadata, []);
    }
  )();

/**
 * Logs a facet value selection event.
 * @param payload (FacetSelectionChangeMetadata) Object specifying the target facet and value.
 */
export const logFacetSelect = (payload: FacetSelectionChangeMetadata) =>
  makeAnalyticsAction(
    'analytics/facet/select',
    AnalyticsType.Search,
    (client, state) => {
      validatePayload(payload, {
        facetId: facetIdDefinition,
        facetValue: requiredNonEmptyString,
      });

      const metadata = buildFacetSelectionChangeMetadata(
        payload,
        getStateNeededForFacetMetadata(state)
      );

      return client.logFacetSelect(metadata, []);
    }
  )();

/**
 * Logs a facet deselect event.
 * @param payload (FacetSelectionChangeMetadata) Object specifying the target facet and value.
 */
export const logFacetDeselect = (payload: FacetSelectionChangeMetadata) =>
  makeAnalyticsAction(
    'analytics/facet/deselect',
    AnalyticsType.Search,
    (client, state) => {
      validatePayload(payload, {
        facetId: facetIdDefinition,
        facetValue: requiredNonEmptyString,
      });
      const metadata = buildFacetSelectionChangeMetadata(
        payload,
        getStateNeededForFacetMetadata(state)
      );
      return client.logFacetDeselect(metadata, []);
    }
  )();

function buildFacetSelectionChangeMetadata(
  payload: FacetSelectionChangeMetadata,
  state: SectionNeededForFacetMetadata
) {
  const {facetId, facetValue} = payload;
  const base = buildFacetBaseMetadata(facetId, state);

  return {...base, facetValue};
}

function getStateNeededForFacetMetadata(
  s: Partial<SearchAppState>
): SectionNeededForFacetMetadata {
  return {
    facetSet: s.facetSet || getFacetSetInitialState(),
    categoryFacetSet: s.categoryFacetSet || getCategoryFacetSetInitialState(),
    dateFacetSet: s.dateFacetSet || getDateFacetSetInitialState(),
    numericFacetSet: s.numericFacetSet || getNumericFacetSetInitialState(),
  };
}

function buildFacetBaseMetadata(
  facetId: string,
  state: SectionNeededForFacetMetadata
) {
  const facet =
    state.facetSet[facetId] ||
    state.categoryFacetSet[facetId] ||
    state.dateFacetSet[facetId] ||
    state.numericFacetSet[facetId];

  const facetField = facet.field;
  const facetTitle = `${facetField}_${facetId}`;

  return {facetId, facetField, facetTitle};
}

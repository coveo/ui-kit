import {Value} from '@coveo/bueno';
import {SearchAnalyticsProvider} from '../../../api/analytics/search-analytics';
import {
  validatePayload,
  requiredNonEmptyString,
} from '../../../utils/validate-payload';
import {
  makeAnalyticsAction,
  LegacySearchAction,
} from '../../analytics/analytics-utils';
import {SearchPageEvents} from '../../analytics/search-action-cause';
import {SearchAction} from '../../search/search-actions';
import {facetIdDefinition} from '../generic/facet-actions-validation';
import {RangeFacetSortCriterion} from '../range-facets/generic/interfaces/request';
import {
  buildFacetBaseMetadata,
  getStateNeededForFacetMetadata,
  buildFacetSelectionChangeMetadata,
} from './facet-set-analytics-actions-utils';
import {FacetSortCriterion} from './interfaces/request';

export const logFacetShowMore = (facetId: string): LegacySearchAction =>
  makeAnalyticsAction('analytics/facet/showMore', (client, state) => {
    validatePayload(facetId, facetIdDefinition);
    const metadata = buildFacetBaseMetadata(
      facetId,
      getStateNeededForFacetMetadata(state)
    );
    return client.makeFacetShowMore(metadata);
  });

export const logFacetShowLess = (facetId: string): LegacySearchAction =>
  makeAnalyticsAction('analytics/facet/showLess', (client, state) => {
    validatePayload(facetId, facetIdDefinition);
    const metadata = buildFacetBaseMetadata(
      facetId,
      getStateNeededForFacetMetadata(state)
    );

    return client.makeFacetShowLess(metadata);
  });

export interface LogFacetUpdateSortActionCreatorPayload {
  /**
   * The facet id.
   */
  facetId: string;

  /**
   * The updated sort criterion.
   */
  criterion: FacetSortCriterion | RangeFacetSortCriterion;
}

//TODO: KIT-2859
export const logFacetUpdateSort = (
  payload: LogFacetUpdateSortActionCreatorPayload
): LegacySearchAction =>
  makeAnalyticsAction('analytics/facet/sortChange', (client, state) => {
    validatePayload(payload, {
      facetId: facetIdDefinition,
      criterion: new Value<FacetSortCriterion | RangeFacetSortCriterion>({
        required: true,
      }),
    });

    const {facetId, criterion} = payload;
    const stateForAnalytics = getStateNeededForFacetMetadata(state);

    const base = buildFacetBaseMetadata(facetId, stateForAnalytics);
    const metadata = {...base, criteria: criterion};

    return client.makeFacetUpdateSort(metadata);
  });

//TODO: KIT-2859
export const logFacetClearAll = (facetId: string): LegacySearchAction =>
  makeAnalyticsAction('analytics/facet/reset', (client, state) => {
    validatePayload(facetId, facetIdDefinition);

    const stateForAnalytics = getStateNeededForFacetMetadata(state);
    const metadata = buildFacetBaseMetadata(facetId, stateForAnalytics);

    return client.makeFacetClearAll(metadata);
  });

export interface LogFacetSelectActionCreatorPayload {
  /**
   * The facet id.
   */
  facetId: string;

  /**
   * The facet value that was selected.
   */
  facetValue: string;
}

//TODO: KIT-2859
export const logFacetSelect = (
  payload: LogFacetSelectActionCreatorPayload
): LegacySearchAction =>
  makeAnalyticsAction('analytics/facet/select', (client, state) => {
    validatePayload(payload, {
      facetId: facetIdDefinition,
      facetValue: requiredNonEmptyString,
    });

    const stateForAnalytics = getStateNeededForFacetMetadata(state);
    const metadata = buildFacetSelectionChangeMetadata(
      payload,
      stateForAnalytics
    );

    return client.makeFacetSelect(metadata);
  });

export interface LogFacetExcludeActionCreatorPayload {
  /**
   * The facet id.
   */
  facetId: string;

  /**
   * The facet value that was excluded.
   */
  facetValue: string;
}

//TODO: KIT-2859
export const logFacetExclude = (
  payload: LogFacetExcludeActionCreatorPayload
): LegacySearchAction =>
  makeAnalyticsAction('analytics/facet/exclude', (client, state) => {
    validatePayload(payload, {
      facetId: facetIdDefinition,
      facetValue: requiredNonEmptyString,
    });

    const stateForAnalytics = getStateNeededForFacetMetadata(state);
    const metadata = buildFacetSelectionChangeMetadata(
      payload,
      stateForAnalytics
    );

    return client.makeFacetExclude(metadata);
  });

export interface LogFacetDeselectActionCreatorPayload {
  /**
   * The facet id.
   */
  facetId: string;

  /**
   * The facet value that was deselected.
   */
  facetValue: string;
}

//TODO: KIT-2859
export const logFacetDeselect = (
  payload: LogFacetDeselectActionCreatorPayload
): LegacySearchAction =>
  makeAnalyticsAction('analytics/facet/deselect', (client, state) => {
    validatePayload(payload, {
      facetId: facetIdDefinition,
      facetValue: requiredNonEmptyString,
    });
    const stateForAnalytics = getStateNeededForFacetMetadata(state);
    const metadata = buildFacetSelectionChangeMetadata(
      payload,
      stateForAnalytics
    );

    return client.makeFacetDeselect(metadata);
  });

export interface LogFacetUnexcludeActionCreatorPayload {
  /**
   * The facet id.
   */
  facetId: string;

  /**
   * The facet value that was unexcluded.
   */
  facetValue: string;
}

//TODO: KIT-2859
export const logFacetUnexclude = (
  payload: LogFacetUnexcludeActionCreatorPayload
): LegacySearchAction =>
  makeAnalyticsAction('analytics/facet/unexclude', (client, state) => {
    validatePayload(payload, {
      facetId: facetIdDefinition,
      facetValue: requiredNonEmptyString,
    });
    const stateForAnalytics = getStateNeededForFacetMetadata(state);
    const metadata = buildFacetSelectionChangeMetadata(
      payload,
      stateForAnalytics
    );

    return client.makeFacetUnexclude(metadata);
  });

export interface LogFacetBreadcrumbActionCreatorPayload {
  /**
   * The facet id associated with the breadcrumb.
   */
  facetId: string;

  /**
   * The facet value displayed in the breadcrumb.
   */
  facetValue: string;
}

//TODO: KIT-2859
export const logFacetBreadcrumb = (
  payload: LogFacetBreadcrumbActionCreatorPayload
): LegacySearchAction =>
  makeAnalyticsAction('analytics/facet/breadcrumb', (client, state) => {
    validatePayload(payload, {
      facetId: facetIdDefinition,
      facetValue: requiredNonEmptyString,
    });
    const metadata = buildFacetSelectionChangeMetadata(
      payload,
      getStateNeededForFacetMetadata(state)
    );

    return client.makeBreadcrumbFacet(metadata);
  });

// --------------------- KIT-2859 : Everything above this will get deleted ! :) ---------------------
export const facetUpdateSort = (
  id: string,
  criterion: FacetSortCriterion | RangeFacetSortCriterion
): SearchAction => {
  return {
    actionCause: SearchPageEvents.facetUpdateSort,
    getEventExtraPayload: (state) =>
      new SearchAnalyticsProvider(() => state).getFacetUpdateSortMetadata(
        id,
        criterion
      ),
  };
};

export const facetClearAll = (id: string): SearchAction => {
  return {
    actionCause: SearchPageEvents.facetClearAll,
    getEventExtraPayload: (state) =>
      new SearchAnalyticsProvider(() => state).getFacetClearAllMetadata(id),
  };
};

export const facetSelect = (id: string, value: string): SearchAction => {
  return {
    actionCause: SearchPageEvents.facetSelect,
    getEventExtraPayload: (state) =>
      new SearchAnalyticsProvider(() => state).getFacetMetadata(id, value),
  };
};

export const facetExclude = (id: string, value: string): SearchAction => {
  return {
    actionCause: SearchPageEvents.facetExclude,
    getEventExtraPayload: (state) =>
      new SearchAnalyticsProvider(() => state).getFacetMetadata(id, value),
  };
};

export const facetDeselect = (id: string, value: string): SearchAction => {
  return {
    actionCause: SearchPageEvents.facetDeselect,
    getEventExtraPayload: (state) =>
      new SearchAnalyticsProvider(() => state).getFacetMetadata(id, value),
  };
};

export const facetUnexclude = (id: string, value: string): SearchAction => {
  return {
    actionCause: SearchPageEvents.facetUnexclude,
    getEventExtraPayload: (state) =>
      new SearchAnalyticsProvider(() => state).getFacetMetadata(id, value),
  };
};

export const breadcrumbFacet = (id: string, value: string): SearchAction => {
  return {
    actionCause: SearchPageEvents.breadcrumbFacet,
    getEventExtraPayload: (state) =>
      new SearchAnalyticsProvider(() => state).getFacetMetadata(id, value),
  };
};

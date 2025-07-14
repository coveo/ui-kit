import type {DateRangeRequest} from '../../controllers/insight/facets/range-facet/date-facet/headless-insight-date-facet.js';
import type {NumericRangeRequest} from '../../controllers/insight/facets/range-facet/numeric-facet/headless-insight-numeric-facet.js';
import type {InsightAction} from '../analytics/analytics-utils.js';
import {logFacetUnexclude} from '../facets/facet-set/facet-set-analytics-actions.js';
import {
  logFacetClearAll,
  logFacetDeselect,
  logFacetSelect,
} from '../facets/facet-set/facet-set-insight-analytics-actions.js';
import {logInsightInterfaceChange} from '../insight-search/insight-search-analytics-actions.js';
import {logSearchboxSubmit} from '../query/query-insight-analytics-actions.js';
import {logResultsSort} from '../sort-criteria/sort-criteria-insight-analytics-actions.js';
import type {SearchParameters} from './search-parameter-actions.js';

export function logParametersChange(
  previousParameters: SearchParameters,
  newParameters: SearchParameters
): InsightAction {
  if (previousParameters.q !== newParameters.q) {
    return logSearchboxSubmit();
  }

  if (previousParameters.sortCriteria !== newParameters.sortCriteria) {
    return logResultsSort();
  }

  if (!areFacetParamsEqual(previousParameters.f, newParameters.f)) {
    return logFacetAnalyticsAction(previousParameters.f, newParameters.f);
  }

  if (!areFacetParamsEqual(previousParameters.cf, newParameters.cf)) {
    return logFacetAnalyticsAction(previousParameters.cf, newParameters.cf);
  }

  if (!areFacetParamsEqual(previousParameters.nf, newParameters.nf)) {
    return logRangeFacetAnalyticsAction(
      previousParameters.nf,
      newParameters.nf
    );
  }

  if (!areFacetParamsEqual(previousParameters.df, newParameters.df)) {
    return logRangeFacetAnalyticsAction(
      previousParameters.df,
      newParameters.df
    );
  }

  if (
    !areFacetParamsEqual(previousParameters.fExcluded, newParameters.fExcluded)
  ) {
    return logFacetExcludeAnalyticsAction(
      previousParameters.fExcluded,
      newParameters.fExcluded
    );
  }

  return logInsightInterfaceChange();
}

type AnyFacetParameters = FacetParameters | RangeFacetParameters;

type RangeFacetParameters = Record<
  string,
  (NumericRangeRequest | DateRangeRequest)[]
>;

type FacetParameters = Record<string, string[]>;

function areFacetParamsEqual(
  previousFacetParams: AnyFacetParameters = {},
  newFacetParams: AnyFacetParameters = {}
) {
  return JSON.stringify(previousFacetParams) === JSON.stringify(newFacetParams);
}

function parseRangeFacetParams(facetsParams: RangeFacetParameters) {
  const formattedParams: FacetParameters = {};
  Object.keys(facetsParams).forEach((key) => {
    formattedParams[key] = facetsParams[key].map(
      (facetValue) => `${facetValue.start}..${facetValue.end}`
    );
  });
  return formattedParams;
}

function logFacetAnalyticsAction(
  previousFacets: FacetParameters = {},
  newFacets: FacetParameters = {},
  isExclude: boolean = false
): InsightAction {
  const previousIds = Object.keys(previousFacets);
  const newIds = Object.keys(newFacets);

  const removedIds = previousIds.filter((id) => !newIds.includes(id));
  if (removedIds.length) {
    const facetId = removedIds[0];

    return previousFacets[facetId].length > 1
      ? logFacetClearAll(facetId)
      : (isExclude ? logFacetUnexclude : logFacetDeselect)({
          facetId,
          facetValue: previousFacets[facetId][0],
        });
  }

  const addedIds = newIds.filter((id) => !previousIds.includes(id));
  if (addedIds.length) {
    const facetId = addedIds[0];
    return logFacetSelect({
      facetId,
      facetValue: newFacets[facetId][0],
    });
  }

  const facetIdWithDifferentValues = newIds.find((key) =>
    newFacets[key].filter((facetValue) =>
      previousFacets[key].includes(facetValue)
    )
  );
  if (!facetIdWithDifferentValues) {
    return logInsightInterfaceChange();
  }

  const previousValues = previousFacets[facetIdWithDifferentValues];
  const newValues = newFacets[facetIdWithDifferentValues];

  const addedValues = newValues.filter(
    (value) => !previousValues.includes(value)
  );

  if (addedValues.length) {
    return logFacetSelect({
      facetId: facetIdWithDifferentValues,
      facetValue: addedValues[0],
    });
  }

  const removedValues = previousValues.filter(
    (value) => !newValues.includes(value)
  );

  if (removedValues.length) {
    return (isExclude ? logFacetUnexclude : logFacetDeselect)({
      facetId: facetIdWithDifferentValues,
      facetValue: removedValues[0],
    });
  }

  return logInsightInterfaceChange();
}

function logRangeFacetAnalyticsAction(
  previousFacets: RangeFacetParameters = {},
  newFacets: RangeFacetParameters = {}
): InsightAction {
  return logFacetAnalyticsAction(
    parseRangeFacetParams(previousFacets),
    parseRangeFacetParams(newFacets)
  );
}

function logFacetExcludeAnalyticsAction(
  previousFacets: FacetParameters = {},
  newFacets: FacetParameters = {}
) {
  return logFacetAnalyticsAction(previousFacets, newFacets, true);
}

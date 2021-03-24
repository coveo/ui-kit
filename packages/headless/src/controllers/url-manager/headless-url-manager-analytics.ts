import {SearchParameters} from '../../features/search-parameters/search-parameter-actions';
import {logSearchboxSubmit} from '../../features/query/query-analytics-actions';
import {
  AnalyticsType,
  makeNoopAnalyticsAction,
} from '../../features/analytics/analytics-utils';
import {logResultsSort} from '../../features/sort-criteria/sort-criteria-analytics-actions';
import {
  logFacetClearAll,
  logFacetDeselect,
  logFacetSelect,
} from '../../features/facets/facet-set/facet-set-analytics-actions';
import {NumericRangeRequest} from '../facets/range-facet/numeric-facet/headless-numeric-facet';
import {DateRangeRequest} from '../facets/range-facet/date-facet/headless-date-facet';

export function getParametersChangeAnalyticsAction(
  previousParameters: SearchParameters,
  newParameters: SearchParameters
) {
  if (previousParameters.q !== newParameters.q) {
    return logSearchboxSubmit();
  }

  if (previousParameters.sortCriteria !== newParameters.sortCriteria) {
    return logResultsSort();
  }

  if (areFacetParamsEqual(previousParameters.f, newParameters.f)) {
    return logFacetAnalyticsAction(previousParameters.f, newParameters.f);
  }

  if (areFacetParamsEqual(previousParameters.cf, newParameters.cf)) {
    return logFacetAnalyticsAction(previousParameters.cf, newParameters.cf);
  }

  if (areFacetParamsEqual(previousParameters.nf, newParameters.nf)) {
    return logRangeFacetAnalyticsAction(
      previousParameters.nf,
      newParameters.nf
    );
  }

  if (areFacetParamsEqual(previousParameters.df, newParameters.df)) {
    return logRangeFacetAnalyticsAction(
      previousParameters.df,
      newParameters.df
    );
  }

  // TODO: handle other possible parameters e.g. firstResult, numberOfResults

  return makeNoopAnalyticsAction(AnalyticsType.Search)();
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
  return JSON.stringify(previousFacetParams) !== JSON.stringify(newFacetParams);
}

function parseRangeFacetParams(facetsParams: RangeFacetParameters) {
  const formattedParams: FacetParameters = {};
  Object.keys(facetsParams).forEach(
    (key) =>
      (formattedParams[key] = facetsParams[key].map(
        (facetValue) => `${facetValue.start}..${facetValue.end}`
      ))
  );
  return formattedParams;
}

function logFacetAnalyticsAction(
  previousFacets: FacetParameters = {},
  newFacets: FacetParameters = {}
) {
  const previousIds = Object.keys(previousFacets);
  const newIds = Object.keys(newFacets);

  const removedIds = previousIds.filter((id) => !newIds.includes(id));
  if (removedIds.length) {
    const facetId = removedIds[0];
    return previousFacets[facetId].length > 1
      ? logFacetClearAll(facetId)
      : logFacetDeselect({facetId, facetValue: previousFacets[facetId][0]});
  }

  const addedIds = newIds.filter((id) => !previousIds.includes(id));
  if (addedIds.length) {
    const facetId = addedIds[0];
    return logFacetSelect({
      facetId,
      facetValue: newFacets[facetId][0],
    });
  }

  const facetId = newIds.find((key) =>
    newFacets[key].filter((facetValue) =>
      previousFacets[key].includes(facetValue)
    )
  );
  if (!facetId) {
    return makeNoopAnalyticsAction(AnalyticsType.Search)();
  }

  const previousValues = previousFacets[facetId];
  const newValues = newFacets[facetId];

  const addedValues = newValues.filter(
    (value) => !previousValues.includes(value)
  );

  if (addedValues.length) {
    return logFacetSelect({
      facetId,
      facetValue: addedValues[0],
    });
  }

  const removedValues = previousValues.filter(
    (value) => !newValues.includes(value)
  );

  if (removedValues.length) {
    return logFacetDeselect({
      facetId,
      facetValue: removedValues[0],
    });
  }

  return makeNoopAnalyticsAction(AnalyticsType.Search)();
}

function logRangeFacetAnalyticsAction(
  previousFacets: RangeFacetParameters = {},
  newFacets: RangeFacetParameters = {}
) {
  return logFacetAnalyticsAction(
    parseRangeFacetParams(previousFacets),
    parseRangeFacetParams(newFacets)
  );
}

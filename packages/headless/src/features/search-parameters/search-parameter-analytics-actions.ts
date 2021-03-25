import {SearchParameters} from '../../features/search-parameters/search-parameter-actions';
import {logSearchboxSubmit} from '../../features/query/query-analytics-actions';
import {logResultsSort} from '../../features/sort-criteria/sort-criteria-analytics-actions';
import {
  logFacetClearAll,
  logFacetDeselect,
  logFacetSelect,
} from '../../features/facets/facet-set/facet-set-analytics-actions';
import {DateRangeRequest, NumericRangeRequest} from '../../controllers';
import {logInterfaceChange} from '../analytics/analytics-actions';
import {
  logPageNumber,
  logPagerResize,
} from '../pagination/pagination-analytics-actions';

export function logParametersChange(
  previousParameters: SearchParameters,
  newParameters: SearchParameters
) {
  if (previousParameters.q !== newParameters.q) {
    return logSearchboxSubmit();
  }

  if (previousParameters.sortCriteria !== newParameters.sortCriteria) {
    return logResultsSort();
  }

  if (previousParameters.firstResult !== newParameters.firstResult) {
    return logPageNumber();
  }

  if (previousParameters.numberOfResults !== newParameters.numberOfResults) {
    return logPagerResize();
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

  return logInterfaceChange();
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

  const facetIdWithDifferentValues = newIds.find((key) =>
    newFacets[key].filter((facetValue) =>
      previousFacets[key].includes(facetValue)
    )
  );
  if (!facetIdWithDifferentValues) {
    return logInterfaceChange();
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
    return logFacetDeselect({
      facetId: facetIdWithDifferentValues,
      facetValue: removedValues[0],
    });
  }

  return logInterfaceChange();
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

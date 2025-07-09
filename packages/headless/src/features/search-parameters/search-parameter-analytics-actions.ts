import type {DateRangeRequest} from '../../controllers/core/facets/range-facet/date-facet/headless-core-date-facet.js';
import type {NumericRangeRequest} from '../../controllers/facets/range-facet/numeric-facet/headless-numeric-facet.js';
import {
  facetClearAll,
  facetDeselect,
  facetExclude,
  facetSelect,
  logFacetClearAll,
  logFacetDeselect,
  logFacetExclude,
  logFacetSelect,
  logFacetUnexclude,
} from '../../features/facets/facet-set/facet-set-analytics-actions.js';
import {
  logSearchboxSubmit,
  searchboxSubmit,
} from '../../features/query/query-analytics-actions.js';
import type {SearchParameters} from '../../features/search-parameters/search-parameter-actions.js';
import {
  logResultsSort,
  resultsSort,
} from '../../features/sort-criteria/sort-criteria-analytics-actions.js';
import {
  interfaceChange,
  logInterfaceChange,
} from '../analytics/analytics-actions.js';
import type {LegacySearchAction} from '../analytics/analytics-utils.js';
import {
  logPageNumber,
  logPagerResize,
} from '../pagination/pagination-analytics-actions.js';
import type {SearchAction} from '../search/search-actions.js';

//TODO: KIT-2859
export function legacyLogParametersChange(
  previousParameters: SearchParameters,
  newParameters: SearchParameters
): LegacySearchAction {
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

  if (areFacetParamsNotEqual(previousParameters.f, newParameters.f)) {
    return legacyLogFacetAnalyticsAction(previousParameters.f, newParameters.f);
  }

  if (
    areFacetParamsNotEqual(
      previousParameters.fExcluded,
      newParameters.fExcluded
    )
  ) {
    return legacyLogFacetAnalyticsAction(
      previousParameters.fExcluded,
      newParameters.fExcluded,
      true
    );
  }

  if (areFacetParamsNotEqual(previousParameters.cf, newParameters.cf)) {
    return legacyLogFacetAnalyticsAction(
      previousParameters.cf,
      newParameters.cf
    );
  }

  if (areFacetParamsNotEqual(previousParameters.af, newParameters.af)) {
    return legacyLogFacetAnalyticsAction(
      previousParameters.af,
      newParameters.af
    );
  }

  if (areFacetParamsNotEqual(previousParameters.nf, newParameters.nf)) {
    return legacyLogRangeFacetAnalyticsAction(
      previousParameters.nf,
      newParameters.nf
    );
  }

  if (areFacetParamsNotEqual(previousParameters.df, newParameters.df)) {
    return legacyLogRangeFacetAnalyticsAction(
      previousParameters.df,
      newParameters.df
    );
  }

  return logInterfaceChange();
}

//TODO: KIT-2859
function legacyLogFacetAnalyticsAction(
  previousFacets: FacetParameters = {},
  newFacets: FacetParameters = {},
  excluded = false
): LegacySearchAction {
  const previousIds = Object.keys(previousFacets);
  const newIds = Object.keys(newFacets);

  const removedIds = previousIds.filter((id) => !newIds.includes(id));
  if (removedIds.length) {
    const facetId = removedIds[0];
    switch (true) {
      case previousFacets[facetId].length > 1:
        return logFacetClearAll(facetId);
      case excluded:
        return logFacetUnexclude({
          facetId,
          facetValue: previousFacets[facetId][0],
        });
      default:
        return logFacetDeselect({
          facetId,
          facetValue: previousFacets[facetId][0],
        });
    }
  }

  const addedIds = newIds.filter((id) => !previousIds.includes(id));
  if (addedIds.length) {
    const facetId = addedIds[0];
    return excluded
      ? logFacetExclude({
          facetId,
          facetValue: newFacets[facetId][0],
        })
      : logFacetSelect({
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
    return excluded
      ? logFacetExclude({
          facetId: facetIdWithDifferentValues,
          facetValue: addedValues[0],
        })
      : logFacetSelect({
          facetId: facetIdWithDifferentValues,
          facetValue: addedValues[0],
        });
  }

  const removedValues = previousValues.filter(
    (value) => !newValues.includes(value)
  );

  if (removedValues.length) {
    return excluded
      ? logFacetUnexclude({
          facetId: facetIdWithDifferentValues,
          facetValue: removedValues[0],
        })
      : logFacetDeselect({
          facetId: facetIdWithDifferentValues,
          facetValue: removedValues[0],
        });
  }

  return logInterfaceChange();
}

//TODO: KIT-2859
function legacyLogRangeFacetAnalyticsAction(
  previousFacets: RangeFacetParameters = {},
  newFacets: RangeFacetParameters = {}
): LegacySearchAction {
  return legacyLogFacetAnalyticsAction(
    parseRangeFacetParams(previousFacets),
    parseRangeFacetParams(newFacets)
  );
}

// --------------------- KIT-2859 : Everything above this will get deleted ! :) ---------------------
export function parametersChange(
  previousParameters: SearchParameters,
  newParameters: SearchParameters
): SearchAction {
  if (previousParameters.q !== newParameters.q) {
    return searchboxSubmit();
  }

  if (previousParameters.sortCriteria !== newParameters.sortCriteria) {
    return resultsSort();
  }

  if (areFacetParamsNotEqual(previousParameters.f, newParameters.f)) {
    return facetAction(previousParameters.f, newParameters.f);
  }

  if (
    areFacetParamsNotEqual(
      previousParameters.fExcluded,
      newParameters.fExcluded
    )
  ) {
    return facetAction(
      previousParameters.fExcluded,
      newParameters.fExcluded,
      true
    );
  }

  if (areFacetParamsNotEqual(previousParameters.cf, newParameters.cf)) {
    return facetAction(previousParameters.cf, newParameters.cf);
  }

  if (areFacetParamsNotEqual(previousParameters.af, newParameters.af)) {
    return facetAction(previousParameters.af, newParameters.af);
  }

  if (areFacetParamsNotEqual(previousParameters.nf, newParameters.nf)) {
    return facetAction(
      parseRangeFacetParams(previousParameters.nf),
      parseRangeFacetParams(newParameters.nf)
    );
  }

  if (areFacetParamsNotEqual(previousParameters.df, newParameters.df)) {
    return facetAction(
      parseRangeFacetParams(previousParameters.df),
      parseRangeFacetParams(newParameters.df)
    );
  }

  return interfaceChange();
}

function areFacetParamsNotEqual(
  previousFacetParams: AnyFacetParameters = {},
  newFacetParams: AnyFacetParameters = {}
) {
  return JSON.stringify(previousFacetParams) !== JSON.stringify(newFacetParams);
}

type AnyFacetParameters = FacetParameters | RangeFacetParameters;

type RangeFacetParameters = Record<
  string,
  (NumericRangeRequest | DateRangeRequest)[]
>;

type FacetParameters = Record<string, string[]>;

function facetAction(
  previousFacets: FacetParameters = {},
  newFacets: FacetParameters = {},
  excluded = false
): SearchAction {
  const previousIds = Object.keys(previousFacets);
  const newIds = Object.keys(newFacets);

  const removedIds = previousIds.filter((id) => !newIds.includes(id));
  if (removedIds.length) {
    const facetId = removedIds[0];
    return previousFacets[facetId].length > 1
      ? facetClearAll()
      : facetDeselect();
  }

  const addedIds = newIds.filter((id) => !previousIds.includes(id));
  if (addedIds.length) {
    return excluded ? facetExclude() : facetSelect();
  }

  const facetIdWithDifferentValues = newIds.find((key) =>
    newFacets[key].filter((facetValue) =>
      previousFacets[key].includes(facetValue)
    )
  );
  if (!facetIdWithDifferentValues) {
    return interfaceChange();
  }

  const previousValues = previousFacets[facetIdWithDifferentValues];
  const newValues = newFacets[facetIdWithDifferentValues];

  const addedValues = newValues.filter(
    (value) => !previousValues.includes(value)
  );

  if (addedValues.length) {
    return excluded ? facetExclude() : facetSelect();
  }

  const removedValues = previousValues.filter(
    (value) => !newValues.includes(value)
  );

  if (removedValues.length) {
    return facetDeselect();
  }

  return interfaceChange();
}

function parseRangeFacetParams(facetsParams: RangeFacetParameters = {}) {
  const formattedParams: FacetParameters = {};
  Object.keys(facetsParams).forEach((key) => {
    formattedParams[key] = facetsParams[key].map(
      (facetValue) => `${facetValue.start}..${facetValue.end}`
    );
  });
  return formattedParams;
}

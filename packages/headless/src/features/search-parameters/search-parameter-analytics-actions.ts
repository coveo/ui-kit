import {DateRangeRequest} from '../../controllers/core/facets/range-facet/date-facet/headless-core-date-facet';
import {NumericRangeRequest} from '../../controllers/facets/range-facet/numeric-facet/headless-numeric-facet';
import {
  facetClearAll,
  facetDeselect,
  facetExclude,
  facetSelect,
} from '../../features/facets/facet-set/facet-set-analytics-actions';
import {
  searchboxSubmit,
} from '../../features/query/query-analytics-actions';
import {SearchParameters} from '../../features/search-parameters/search-parameter-actions';
import {
  resultsSort,
} from '../../features/sort-criteria/sort-criteria-analytics-actions';
import {
  interfaceChange,
} from '../analytics/analytics-actions';
import {SearchAction} from '../search/search-actions';

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
  Object.keys(facetsParams).forEach(
    (key) =>
      (formattedParams[key] = facetsParams[key].map(
        (facetValue) => `${facetValue.start}..${facetValue.end}`
      ))
  );
  return formattedParams;
}

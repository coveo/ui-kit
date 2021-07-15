import {DateFacetResponse, DateFacetValue} from './interfaces/response';
import {baseFacetResponseSelector} from '../../facet-set/facet-set-selectors';
import {AnyFacetResponse} from '../../generic/interfaces/generic-facet-response';
import {
  DateFacetSection,
  SearchSection,
} from '../../../../state/state-sections';
import {DateRangeRequest} from './interfaces/request';

function isDateFacetResponse(
  state: SearchSection & DateFacetSection,
  response: AnyFacetResponse | undefined
): response is DateFacetResponse {
  return !!response && response.facetId in state.dateFacetSet;
}

export const dateFacetResponseSelector = (
  state: SearchSection & DateFacetSection,
  facetId: string
): DateFacetResponse | undefined => {
  const response = baseFacetResponseSelector(state, facetId);
  const request = state.dateFacetSet[facetId];

  if (isDateFacetResponse(state, response)) {
    return {
      ...response,
      values: request
        ? assignRelativeDates(request.currentValues, response.values)
        : response.values,
    };
  }

  return undefined;
};

export const dateFacetSelectedValuesSelector = (
  state: SearchSection & DateFacetSection,
  facetId: string
): DateFacetValue[] => {
  const facetResponse = dateFacetResponseSelector(state, facetId);
  if (!facetResponse) {
    return [];
  }
  return facetResponse.values.filter((value) => value.state === 'selected');
};

export function assignRelativeDates<
  T extends DateRangeRequest | DateFacetValue
>(requestValues: DateRangeRequest[], responseValues: T[]): T[] {
  const valuesWithRelativeDates = requestValues.filter(
    (value) => value.relativeDate
  );

  return responseValues.map((responseValue) => {
    const relativeDateValueMatch = valuesWithRelativeDates.find(
      ({start, end, endInclusive}) =>
        responseValue.start === start &&
        responseValue.end === end &&
        responseValue.endInclusive === endInclusive
    );

    const relativeDateObj = relativeDateValueMatch
      ? {relativeDate: relativeDateValueMatch.relativeDate}
      : {};

    return {
      ...responseValue,
      ...relativeDateObj,
    };
  });
}

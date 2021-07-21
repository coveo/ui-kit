import {DateFacetResponse} from './interfaces/response';
import {baseFacetResponseSelector} from '../../facet-set/facet-set-selectors';
import {AnyFacetResponse} from '../../generic/interfaces/generic-facet-response';
import {
  DateFacetSection,
  RelativeDateSection,
  SearchSection,
} from '../../../../state/state-sections';
import {DateFacetValue} from '../../../../controllers';

function isDateFacetResponse(
  state: SearchSection & DateFacetSection,
  response: AnyFacetResponse | undefined
): response is DateFacetResponse {
  return !!response && response.facetId in state.dateFacetSet;
}

export const dateFacetResponseSelector = (
  state: SearchSection & DateFacetSection,
  facetId: string
) => {
  const response = baseFacetResponseSelector(state, facetId);
  if (isDateFacetResponse(state, response)) {
    return response;
  }

  return undefined;
};

export const dateFacetValuesSelector = (
  state: SearchSection & DateFacetSection & RelativeDateSection,
  facetId: string
): DateFacetValue[] => {
  const facetResponse = dateFacetResponseSelector(state, facetId);
  if (!facetResponse) {
    return [];
  }

  const relativeDates = state.relativeDateSet[facetId];
  if (relativeDates) {
    return facetResponse.values.map((facetValue) => ({
      ...facetValue,
      relativeStart: relativeDates.find(
        ({value}) => facetValue.start === value
      ),
      relativeEnd: relativeDates.find(({value}) => facetValue.end === value),
    }));
  }

  return facetResponse.values;
};

export const dateFacetSelectedValuesSelector = (
  state: SearchSection & DateFacetSection & RelativeDateSection,
  facetId: string
): DateFacetValue[] => {
  return dateFacetValuesSelector(state, facetId).filter(
    (value) => value.state === 'selected'
  );
};

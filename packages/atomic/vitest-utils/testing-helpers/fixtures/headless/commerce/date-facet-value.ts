import {DateFacetValue} from '@coveo/headless/commerce';

const defaultDateFacetValue: DateFacetValue = {
  start: 'past-1-month',
  end: 'now',
  endInclusive: true,
  numberOfResults: 10,
  moreValuesAvailable: false,
  state: 'idle',
  isAutoSelected: false,
  isSuggested: false,
};

export const buildFakeCommerceDateFacetValue = (
  override: Partial<DateFacetValue> = {}
): DateFacetValue => ({
  ...defaultDateFacetValue,
  ...override,
});

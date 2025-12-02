import type {DateFacetValue} from '@coveo/headless/commerce';

const defaultDateFacetValue = {
  start: 'past-1-month',
  end: 'now',
  endInclusive: true,
  numberOfResults: 10,
  moreValuesAvailable: false,
  state: 'idle',
  isAutoSelected: false,
  isSuggested: false,
} satisfies DateFacetValue;

export const buildFakeCommerceDateFacetValue = (
  override: Partial<DateFacetValue> = {}
): DateFacetValue => ({
  ...defaultDateFacetValue,
  ...override,
});

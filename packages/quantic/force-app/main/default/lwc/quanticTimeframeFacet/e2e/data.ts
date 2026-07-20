const facetId = 'Date';
const field = 'Date';

/**
 * Facet response before any value is selected.
 *
 * The values mirror the relative timeframes declared on the exampleQuanticTimeframeFacet.html file
 */
export const initialFacetData = {
  facetId,
  field,
  moreValuesAvailable: false,
  values: [
    {
      start: 'now',
      end: 'next-1-year',
      endInclusive: false,
      state: 'idle',
      numberOfResults: 10,
    },
    {
      start: 'past-2-week',
      end: 'now',
      endInclusive: false,
      state: 'idle',
      numberOfResults: 20,
    },
    {
      start: 'past-1-month',
      end: 'now',
      endInclusive: false,
      state: 'idle',
      numberOfResults: 30,
    },
    {
      start: 'past-1-year',
      end: 'now',
      endInclusive: false,
      state: 'idle',
      numberOfResults: 40,
    },
    {
      start: 'past-10-year',
      end: 'now',
      endInclusive: false,
      state: 'idle',
      numberOfResults: 50,
    },
  ],
  indexScore: 0.4,
};

const [firstRange, ...remainingRanges] = initialFacetData.values;

/**
 * Facet response after the first value is selected.
 */
export const selectedFacetData = {
  ...initialFacetData,
  values: [
    {
      ...firstRange,
      state: 'selected',
    },
    ...remainingRanges,
  ],
};

const facetId = 'ytlikecount';
const field = 'ytlikecount';

/**
 * Facet response before any value is selected.
 */
export const initialFacetData = {
  domain: {
    start: 0,
    end: 200,
  },
  facetId,
  field,
  moreValuesAvailable: false,
  values: [
    {
      start: 0,
      end: 100,
      endInclusive: false,
      state: 'idle',
      numberOfResults: 10,
    },
    {
      start: 100,
      end: 200,
      endInclusive: false,
      state: 'idle',
      numberOfResults: 20,
    },
  ],
  indexScore: 0.4,
};

const [firstRange, secondRange] = initialFacetData.values;

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
    secondRange,
  ],
};

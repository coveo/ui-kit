const facetId = 'Date';
const field = 'Date';

/**
 * Facet response before any value is selected.
 */
export const initialFacetData = {
  facetId,
  field,
  moreValuesAvailable: true,
  values: [
    {
      start: '2025/01/01@00:00:00',
      end: '2024/01/01@00:00:00',
      endInclusive: false,
      state: 'idle',
      numberOfResults: 35,
    },
    {
      start: '2024/01/01@00:00:00',
      end: '2023/01/01@00:00:00',
      endInclusive: false,
      state: 'idle',
      numberOfResults: 35,
    },
  ],
  indexScore: 0.40500903971252294,
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

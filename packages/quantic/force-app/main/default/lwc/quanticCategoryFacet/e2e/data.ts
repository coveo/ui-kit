const facetId = 'geographicalhierarchy';
const field = 'geographicalhierarchy';
const label = 'Country';

/**
 * Facet response before any value is selected.
 */
export const initialFacetData = {
  facetId,
  field,
  moreValuesAvailable: true,
  values: [
    {
      value: 'North America',
      state: 'idle',
      numberOfResults: 112,
      children: [],
      path: ['North America'],
      isLeafValue: false,
    },
    {
      value: 'Africa',
      state: 'idle',
      numberOfResults: 58,
      children: [],
      path: ['Africa'],
      isLeafValue: false,
    },
  ],
  indexScore: 1,
  label,
};

const [northAmerica] = initialFacetData.values;

/**
 * Facet response after clicking "Show more".
 */
export const expandedFacetData = {
  ...initialFacetData,
  values: [
    ...initialFacetData.values,
    {
      value: 'South America',
      state: 'idle',
      numberOfResults: 112,
      children: [],
      path: ['South America'],
      isLeafValue: false,
    },
    {
      value: 'Asia',
      state: 'idle',
      numberOfResults: 58,
      children: [],
      path: ['Asia'],
      isLeafValue: false,
    },
  ],
};

/**
 * Facet response after the first parent value is selected.
 */
export const selectedFacetData = {
  ...initialFacetData,
  values: [
    {
      ...northAmerica,
      state: 'selected',
      children: [
        {
          value: 'Canada',
          state: 'idle',
          numberOfResults: 45,
          children: [],
          path: ['North America', 'Canada'],
          isLeafValue: true,
        },
        {
          value: 'United States',
          state: 'idle',
          numberOfResults: 67,
          children: [],
          path: ['North America', 'United States'],
          isLeafValue: true,
        },
      ],
    },
  ],
};

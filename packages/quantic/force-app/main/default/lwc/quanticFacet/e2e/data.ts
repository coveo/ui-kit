const facetId = 'objecttype';
const field = 'objecttype';
const label = 'Object type';

/**
 * Facet response before any value is selected.
 */
export const initialFacetData = {
  facetId,
  field,
  moreValuesAvailable: true,
  values: [
    {
      value: 'People',
      state: 'idle',
      numberOfResults: 126959,
    },
    {
      value: 'Contact',
      state: 'idle',
      numberOfResults: 179426,
    },
  ],
  indexScore: 0.40500903971252294,
  label,
};

const [people, contact] = initialFacetData.values;

/**
 * Facet response after clicking "Show more".
 */
export const expandedFacetData = {
  ...initialFacetData,
  values: [
    ...initialFacetData.values,
    {
      value: 'Variant',
      state: 'idle',
      numberOfResults: 30827,
    },
    {
      value: 'Message',
      state: 'idle',
      numberOfResults: 26879,
    },
  ],
};

/**
 * Facet response after the first value is selected.
 */
export const selectedFacetData = {
  ...initialFacetData,
  values: [
    {
      ...people,
      state: 'selected',
    },
    contact,
  ],
};

/**
 * Facet response builder for the facet manager example page
 * (`exampleQuanticFacetManager.html`), which registers three facets:
 * a `language` facet, a `date` timeframe facet, and an `objecttype` facet.
 */
const facetManagerData = [
  {
    facetId: 'language',
    field: 'language',
    moreValuesAvailable: false,
    values: [{value: 'English', state: 'idle', numberOfResults: 100}],
    indexScore: 0.3,
  },
  {
    facetId: 'date',
    field: 'date',
    moreValuesAvailable: false,
    values: [
      {
        start: 'past-1-week',
        end: 'now',
        endInclusive: false,
        state: 'idle',
        numberOfResults: 10,
      },
      {
        start: 'past-1-month',
        end: 'now',
        endInclusive: false,
        state: 'idle',
        numberOfResults: 20,
      },
      {
        start: 'past-6-month',
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
    ],
    indexScore: 0.2,
  },
  {
    facetId: 'objecttype',
    field: 'objecttype',
    moreValuesAvailable: false,
    values: [{value: 'People', state: 'idle', numberOfResults: 50}],
    indexScore: 0.1,
  },
];

export default facetManagerData;

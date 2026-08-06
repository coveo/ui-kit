/**
 * Facet response builders for the breadcrumb manager example page
 * (`exampleQuanticBreadcrumbManager.html`), which registers four facets:
 * filetype (regular), ytlikecount (numeric), date (timeframe), and
 * geographicalhierarchy (category).
 */
type State = 'idle' | 'selected';

const filetypeFacet = (state: State = 'idle') => ({
  facetId: 'filetype',
  field: 'filetype',
  moreValuesAvailable: false,
  values: [
    {value: 'YouTubeVideo', state, numberOfResults: 100},
    {value: 'txt', state: 'idle', numberOfResults: 50},
  ],
  indexScore: 0.5,
});

const numericFacet = (state: State = 'idle') => ({
  facetId: 'ytlikecount',
  field: 'ytlikecount',
  moreValuesAvailable: false,
  values: [
    {start: 0, end: 1000, endInclusive: false, state, numberOfResults: 100},
    {
      start: 1000,
      end: 2000,
      endInclusive: false,
      state: 'idle',
      numberOfResults: 50,
    },
  ],
  indexScore: 0.4,
});

const timeframeFacet = (state: State = 'idle') => ({
  facetId: 'date',
  field: 'date',
  moreValuesAvailable: false,
  values: [
    {start: 'past-1-week', end: 'now', endInclusive: false, state, numberOfResults: 100},
    {
      start: 'past-1-month',
      end: 'now',
      endInclusive: false,
      state: 'idle',
      numberOfResults: 50,
    },
    {
      start: 'past-6-month',
      end: 'now',
      endInclusive: false,
      state: 'idle',
      numberOfResults: 40,
    },
    {
      start: 'past-1-year',
      end: 'now',
      endInclusive: false,
      state: 'idle',
      numberOfResults: 30,
    },
    {
      start: 'past-10-year',
      end: 'now',
      endInclusive: false,
      state: 'idle',
      numberOfResults: 20,
    },
  ],
  indexScore: 0.3,
});

const categoryFacet = (state: State = 'idle') => ({
  facetId: 'geographicalhierarchy',
  field: 'geographicalhierarchy',
  moreValuesAvailable: false,
  values:
    state === 'selected'
      ? [
          {
            value: 'North America',
            state: 'selected',
            numberOfResults: 100,
            children: [],
            path: ['North America'],
            isLeafValue: false,
          },
        ]
      : [
          {
            value: 'North America',
            state: 'idle',
            numberOfResults: 100,
            children: [],
            path: ['North America'],
            isLeafValue: false,
          },
          {
            value: 'Africa',
            state: 'idle',
            numberOfResults: 50,
            children: [],
            path: ['Africa'],
            isLeafValue: false,
          },
        ],
  indexScore: 0.2,
});

const allFacets = (selected?: 'regular' | 'numeric' | 'timeframe' | 'category') => [
  filetypeFacet(selected === 'regular' ? 'selected' : 'idle'),
  numericFacet(selected === 'numeric' ? 'selected' : 'idle'),
  timeframeFacet(selected === 'timeframe' ? 'selected' : 'idle'),
  categoryFacet(selected === 'category' ? 'selected' : 'idle'),
];

export const allIdle = allFacets();
export const regularSelected = allFacets('regular');
export const numericSelected = allFacets('numeric');
export const timeframeSelected = allFacets('timeframe');
export const categorySelected = allFacets('category');

export const regularAndTimeframeSelected = [
  filetypeFacet('selected'),
  numericFacet('idle'),
  timeframeFacet('selected'),
  categoryFacet('idle'),
];

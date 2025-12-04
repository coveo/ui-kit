import type {Meta, StoryObj as Story} from '@storybook/web-components-vite';
import {getStorybookHelpers} from '@wc-toolkit/storybook-helpers';
import {MockSearchApi} from '@/storybook-utils/api/search/mock';
import {parameters} from '@/storybook-utils/common/common-meta-parameters';
import {
  playExecuteFirstSearch,
  wrapInSearchInterface,
} from '@/storybook-utils/search/search-interface-wrapper';

const searchApiHarness = new MockSearchApi();

// Category facet values representing a geographical hierarchy
const baseCategoryFacetValues = [
  {
    value: 'North America',
    numberOfResults: 245,
    path: ['North America'],
    state: 'idle',
    moreValuesAvailable: true,
    isLeafValue: false,
    children: [],
  },
  {
    value: 'Europe',
    numberOfResults: 189,
    path: ['Europe'],
    state: 'idle',
    moreValuesAvailable: true,
    isLeafValue: false,
    children: [],
  },
  {
    value: 'Asia',
    numberOfResults: 156,
    path: ['Asia'],
    state: 'idle',
    moreValuesAvailable: true,
    isLeafValue: false,
    children: [],
  },
  {
    value: 'South America',
    numberOfResults: 87,
    path: ['South America'],
    state: 'idle',
    moreValuesAvailable: true,
    isLeafValue: false,
    children: [],
  },
  {
    value: 'Africa',
    numberOfResults: 65,
    path: ['Africa'],
    state: 'idle',
    moreValuesAvailable: false,
    isLeafValue: false,
    children: [],
  },
];

const createCategoryFacetResponse = (
  values: typeof baseCategoryFacetValues,
  facetId = 'geographicalhierarchy'
) => ({
  facetId,
  field: 'geographicalhierarchy',
  values,
  indexScore: 0,
});

const mockDefaultCategoryFacetResponse = (
  facetId = 'geographicalhierarchy'
) => {
  searchApiHarness.searchEndpoint.mockOnce((response) => {
    if ('categoryFacets' in response) {
      return {
        ...response,
        categoryFacets: [
          ...(response.categoryFacets || []),
          createCategoryFacetResponse(baseCategoryFacetValues, facetId),
        ],
      };
    }
    return response;
  });
};

const mockLowFacetValuesResponse = () => {
  searchApiHarness.searchEndpoint.mockOnce((response) => {
    if ('categoryFacets' in response) {
      return {
        ...response,
        categoryFacets: [
          ...(response.categoryFacets || []),
          createCategoryFacetResponse(baseCategoryFacetValues.slice(0, 2)),
        ],
      };
    }
    return response;
  });
};

const {decorator, play} = wrapInSearchInterface();
const {events, args, argTypes, template} = getStorybookHelpers(
  'atomic-category-facet',
  {excludeCategories: ['methods']}
);

const meta: Meta = {
  component: 'atomic-category-facet',
  title: 'Search/CategoryFacet',
  id: 'atomic-category-facet',
  render: (args) => template(args),
  decorators: [decorator],
  parameters: {
    ...parameters,
    actions: {
      handles: events,
    },
    msw: {handlers: [...searchApiHarness.handlers]},
  },
  argTypes,
  beforeEach: () => {
    searchApiHarness.searchEndpoint.clear();
    searchApiHarness.facetSearchEndpoint.clear();
    searchApiHarness.facetSearchEndpoint.mock(() => ({
      values: [
        {displayValue: 'North America', rawValue: 'North America', count: 245},
        {displayValue: 'New York', rawValue: 'New York', count: 87},
        {displayValue: 'California', rawValue: 'California', count: 65},
      ],
      moreValuesAvailable: true,
    }));
  },
  play,
  args: {
    ...args,
    numberOfValues: 8,
  },
};

export default meta;

export const Default: Story = {
  name: 'atomic-category-facet',
  args: {
    field: 'geographicalhierarchy',
    label: 'Geographical Hierarchy',
    'with-search': true,
    'number-of-values': 5,
    'sort-criteria': 'occurrences',
  },
  beforeEach: () => {
    mockDefaultCategoryFacetResponse();
  },
};

export const LowFacetValues: Story = {
  tags: ['test'],
  args: {
    field: 'geographicalhierarchy',
    'number-of-values': 2,
    'with-search': true,
  },
  beforeEach: () => {
    mockLowFacetValuesResponse();
  },
};

export const WithCustomAllCategoriesLabelById: Story = {
  name: 'With custom all categories label, using facetId',
  tags: ['!dev'],
  play: async (context) => {
    await play(context);
    const searchInterface =
      context.canvasElement.querySelector<HTMLAtomicSearchInterfaceElement>(
        'atomic-search-interface'
      );
    searchInterface?.i18n.addResourceBundle('en', 'translation', {
      'all-categories-my-awesome-facet': 'My Awesome Facet',
    });
    await playExecuteFirstSearch(context);
  },
  args: {
    field: 'geographicalhierarchy',
    label: 'Geographical Hierarchy',
    'facet-id': 'my-awesome-facet',
    'with-search': true,
    'number-of-values': 5,
    'sort-criteria': 'occurrences',
  },
  beforeEach: () => {
    mockDefaultCategoryFacetResponse('my-awesome-facet');
  },
};

export const WithCustomAllCategoriesLabelByField: Story = {
  tags: ['!dev'],
  name: 'With custom all categories label, using field',
  play: async (context) => {
    await play(context);
    const searchInterface =
      context.canvasElement.querySelector<HTMLAtomicSearchInterfaceElement>(
        'atomic-search-interface'
      );
    searchInterface?.i18n.addResourceBundle('en', 'translation', {
      'all-categories-geographicalhierarchy': 'My Awesome Facet',
    });
    await playExecuteFirstSearch(context);
  },
  args: {
    field: 'geographicalhierarchy',
    label: 'Geographical Hierarchy',
    'with-search': true,
    'number-of-values': 5,
    'sort-criteria': 'occurrences',
  },
  beforeEach: () => {
    mockDefaultCategoryFacetResponse();
  },
};

export const WithCustomAllCategoriesLabelWithIdAndFieldCompeting: Story = {
  tags: ['!dev'],
  name: 'With custom all categories label, using field',
  play: async (context) => {
    await play(context);
    const searchInterface =
      context.canvasElement.querySelector<HTMLAtomicSearchInterfaceElement>(
        'atomic-search-interface'
      );
    searchInterface?.i18n.addResourceBundle('en', 'translation', {
      'all-categories-geographicalhierarchy': 'My Super Awesome Facet',
    });
    searchInterface?.i18n.addResourceBundle('en', 'translation', {
      'all-categories-my-awesome-facet': 'My Awesome Facet',
    });
    await playExecuteFirstSearch(context);
  },
  args: {
    field: 'geographicalhierarchy',
    label: 'Geographical Hierarchy',
    'facet-id': 'my-awesome-facet',
    'with-search': true,
    'number-of-values': 5,
    'sort-criteria': 'occurrences',
  },
  beforeEach: () => {
    mockDefaultCategoryFacetResponse('my-awesome-facet');
  },
};

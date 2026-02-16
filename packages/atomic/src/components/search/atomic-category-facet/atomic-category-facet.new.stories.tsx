import type {Meta, StoryObj as Story} from '@storybook/web-components-vite';
import {getStorybookHelpers} from '@wc-toolkit/storybook-helpers';
import {MockSearchApi} from '@/storybook-utils/api/search/mock';
import {parameters} from '@/storybook-utils/common/common-meta-parameters';
import {facetDecorator} from '@/storybook-utils/common/facets-decorator';
import {wrapInSearchInterface} from '@/storybook-utils/search/search-interface-wrapper';

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
  {
    value: 'Oceania',
    numberOfResults: 42,
    path: ['Oceania'],
    state: 'idle',
    moreValuesAvailable: false,
    isLeafValue: false,
    children: [],
  },
  {
    value: 'Antarctica',
    numberOfResults: 12,
    path: ['Antarctica'],
    state: 'idle',
    moreValuesAvailable: false,
    isLeafValue: true,
    children: [],
  },
  {
    value: 'Central America',
    numberOfResults: 34,
    path: ['Central America'],
    state: 'idle',
    moreValuesAvailable: false,
    isLeafValue: false,
    children: [],
  },
];

// Child values for North America
const northAmericaChildValues = [
  {
    value: 'United States',
    numberOfResults: 145,
    path: ['North America', 'United States'],
    state: 'idle',
    moreValuesAvailable: true,
    isLeafValue: false,
    children: [],
  },
  {
    value: 'Canada',
    numberOfResults: 67,
    path: ['North America', 'Canada'],
    state: 'idle',
    moreValuesAvailable: true,
    isLeafValue: false,
    children: [],
  },
  {
    value: 'Mexico',
    numberOfResults: 33,
    path: ['North America', 'Mexico'],
    state: 'idle',
    moreValuesAvailable: false,
    isLeafValue: false,
    children: [],
  },
];

// Child values for United States (third level)
const unitedStatesChildValues = [
  {
    value: 'California',
    numberOfResults: 45,
    path: ['North America', 'United States', 'California'],
    state: 'idle',
    moreValuesAvailable: false,
    isLeafValue: true,
    children: [],
  },
  {
    value: 'New York',
    numberOfResults: 38,
    path: ['North America', 'United States', 'New York'],
    state: 'idle',
    moreValuesAvailable: false,
    isLeafValue: true,
    children: [],
  },
  {
    value: 'Texas',
    numberOfResults: 32,
    path: ['North America', 'United States', 'Texas'],
    state: 'idle',
    moreValuesAvailable: false,
    isLeafValue: true,
    children: [],
  },
];

const createCategoryFacetResponse = (
  values: typeof baseCategoryFacetValues,
  facetId = 'geographicalhierarchy'
) => ({
  facetId,
  field: 'geographicalhierarchy',
  moreValuesAvailable: values.length >= 5,
  values,
  indexScore: 0,
});

type CategoryFacetValue = {
  value: string;
  numberOfResults: number;
  path: string[];
  state: string;
  moreValuesAvailable: boolean;
  isLeafValue: boolean;
  children: CategoryFacetValue[];
};

const createSelectedCategoryFacetResponse = (
  selectedPath: string[],
  children: CategoryFacetValue[],
  facetId = 'geographicalhierarchy'
) => {
  // Build the parent chain with selected state
  const buildParentChain = (
    path: string[],
    depth = 0
  ): CategoryFacetValue | null => {
    if (depth >= path.length) {
      return null;
    }

    const value = path[depth];
    const isSelected = depth === path.length - 1;
    const childValue = buildParentChain(path, depth + 1);

    return {
      value,
      numberOfResults: 245 - depth * 50,
      path: path.slice(0, depth + 1),
      state: isSelected ? 'selected' : 'idle',
      moreValuesAvailable: !isSelected,
      isLeafValue: false,
      children: isSelected ? children : childValue ? [childValue] : [],
    };
  };

  const parentChain = buildParentChain(selectedPath);

  return {
    facetId,
    field: 'geographicalhierarchy',
    moreValuesAvailable: false,
    values: parentChain ? [parentChain] : [],
    indexScore: 0,
  };
};

const mockDefaultCategoryFacetResponse = (
  facetId = 'geographicalhierarchy'
) => {
  searchApiHarness.searchEndpoint.mockOnce((response) => {
    if ('facets' in response) {
      return {
        ...response,
        facets: [
          ...(response.facets || []),
          createCategoryFacetResponse(baseCategoryFacetValues, facetId),
        ],
      };
    }
    return response;
  });
};

const mockSelectedRootValue = (facetId = 'geographicalhierarchy') => {
  searchApiHarness.searchEndpoint.mockOnce((response) => {
    if ('facets' in response) {
      return {
        ...response,
        facets: [
          ...(response.facets || []),
          createSelectedCategoryFacetResponse(
            ['North America'],
            northAmericaChildValues,
            facetId
          ),
        ],
      };
    }
    return response;
  });
};

const mockSelectedChildValue = (facetId = 'geographicalhierarchy') => {
  searchApiHarness.searchEndpoint.mockOnce((response) => {
    if ('facets' in response) {
      return {
        ...response,
        facets: [
          ...(response.facets || []),
          createSelectedCategoryFacetResponse(
            ['North America', 'United States'],
            unitedStatesChildValues,
            facetId
          ),
        ],
      };
    }
    return response;
  });
};

const mockSelectedChildValueWithMoreAvailable = (
  facetId = 'geographicalhierarchy'
) => {
  searchApiHarness.searchEndpoint.mockOnce((response) => {
    if ('facets' in response) {
      return {
        ...response,
        facets: [
          ...(response.facets || []),
          {
            facetId,
            field: 'geographicalhierarchy',
            moreValuesAvailable: false,
            indexScore: 0,
            values: [
              {
                value: 'North America',
                numberOfResults: 245,
                path: ['North America'],
                state: 'idle',
                moreValuesAvailable: false,
                isLeafValue: false,
                children: [
                  {
                    value: 'United States',
                    numberOfResults: 145,
                    path: ['North America', 'United States'],
                    state: 'selected',
                    moreValuesAvailable: true,
                    isLeafValue: false,
                    children: unitedStatesChildValues,
                  },
                ],
              },
            ],
          },
        ],
      };
    }
    return response;
  });
};

const {decorator, play} = wrapInSearchInterface();

const {events, argTypes} = getStorybookHelpers('atomic-category-facet', {
  excludeCategories: ['methods'],
});

const {template} = getStorybookHelpers('atomic-category-facet', {
  excludeCategories: ['methods', 'cssParts'],
});

const meta: Meta = {
  component: 'atomic-category-facet',
  title: 'Search/Facet (Category)',
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
        {
          displayValue: 'North America',
          rawValue: 'North America',
          count: 245,
          path: ['North America'],
        },
        {
          displayValue: 'New York',
          rawValue: 'New York',
          count: 87,
          path: ['North America', 'United States', 'New York'],
        },
        {
          displayValue: 'California',
          rawValue: 'California',
          count: 65,
          path: ['North America', 'United States', 'California'],
        },
      ],
      moreValuesAvailable: true,
    }));
  },
  play,
};

export default meta;

export const Default: Story = {
  args: {
    field: 'geographicalhierarchy',
    label: 'Geographical Hierarchy',
    'with-search': true,
  },
  decorators: [facetDecorator],
  beforeEach: () => {
    mockDefaultCategoryFacetResponse();
  },
};

export const WithSelectedRootValue: Story = {
  name: 'With Selected Root Value',
  tags: ['test'],
  args: {
    field: 'geographicalhierarchy',
    label: 'Geographical Hierarchy',
    'with-search': true,
  },
  decorators: [facetDecorator],
  beforeEach: () => {
    mockSelectedRootValue();
  },
};

export const WithSelectedChildValue: Story = {
  name: 'With Selected Child Value',
  tags: ['test'],
  args: {
    field: 'geographicalhierarchy',
    label: 'Geographical Hierarchy',
    'with-search': true,
  },
  decorators: [facetDecorator],
  beforeEach: () => {
    mockSelectedChildValue();
  },
};

export const WithSelectedChildValueAndMoreAvailable: Story = {
  name: 'With Selected Child Value And More Available',
  tags: ['test'],
  args: {
    field: 'geographicalhierarchy',
    label: 'Geographical Hierarchy',
    'with-search': true,
  },
  decorators: [facetDecorator],
  beforeEach: () => {
    mockSelectedChildValueWithMoreAvailable();
  },
};

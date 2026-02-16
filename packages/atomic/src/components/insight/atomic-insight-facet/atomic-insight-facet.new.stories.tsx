import type {FacetSortCriterion} from '@coveo/headless/insight';
import type {Meta, StoryObj as Story} from '@storybook/web-components-vite';
import {getStorybookHelpers} from '@wc-toolkit/storybook-helpers';
import {MockInsightApi} from '@/storybook-utils/api/insight/mock';
import {parameters} from '@/storybook-utils/common/common-meta-parameters';
import {facetDecorator} from '@/storybook-utils/common/facets-decorator';
import {wrapInInsightInterface} from '@/storybook-utils/insight/insight-interface-wrapper';

const {decorator, play} = wrapInInsightInterface();
const {events, args, argTypes, template} = getStorybookHelpers(
  'atomic-insight-facet',
  {
    excludeCategories: ['methods'],
  }
);

const mockInsightApi = new MockInsightApi();

const mockDefaultFacetResponse = () => {
  mockInsightApi.searchEndpoint.mockOnce((response) => response);
};

const sortCriteriaOptions: FacetSortCriterion[] = [
  'alphanumeric',
  'alphanumericDescending',
  'alphanumericNatural',
  'alphanumericNaturalDescending',
  'automatic',
  'occurrences',
  'score',
];

const meta: Meta = {
  component: 'atomic-insight-facet',
  title: 'Insight/Facet',
  id: 'atomic-insight-facet',

  render: (args) => template(args),
  decorators: [decorator],
  parameters: {
    ...parameters,
    actions: {
      handles: events,
    },
    msw: {
      handlers: [...mockInsightApi.handlers],
    },
  },
  argTypes: {
    ...argTypes,
    'sort-criteria': {
      control: 'select',
      options: sortCriteriaOptions,
      type: 'string',
    },
  },

  beforeEach: () => {
    mockInsightApi.searchEndpoint.clear();
  },

  play,
  args: {
    ...args,
    'number-of-values': 8,
  },
};

export default meta;

export const Default: Story = {
  args: {
    field: 'objecttype',
  },
  decorators: [facetDecorator],
  beforeEach: () => {
    mockDefaultFacetResponse();
  },
};

export const AsLink: Story = {
  tags: ['test'],
  args: {
    field: 'objecttype',
    'display-values-as': 'link',
  },
  decorators: [facetDecorator],
  beforeEach: () => {
    mockDefaultFacetResponse();
  },
};

export const AsBox: Story = {
  tags: ['test'],
  args: {
    field: 'objecttype',
    'display-values-as': 'box',
  },
  decorators: [facetDecorator],
  beforeEach: () => {
    mockDefaultFacetResponse();
  },
};

export const WithExclusion: Story = {
  tags: ['test'],
  args: {
    field: 'objecttype',
    'enable-exclusion': true,
  },
  decorators: [facetDecorator],
  beforeEach: () => {
    mockDefaultFacetResponse();
  },
};

export const WithSelectedValue: Story = {
  tags: ['test'],
  args: {
    field: 'objecttype',
  },
  decorators: [facetDecorator],
  beforeEach: () => {
    // biome-ignore lint/suspicious/noExplicitAny: MSW mock response structure is dynamic and known at runtime
    mockInsightApi.searchEndpoint.mockOnce((response: any) => {
      const selectedFacets = response.facets?.map(
        (facet: Object & {field: string; values: Object[]}) => {
          if (facet.field === 'objecttype') {
            return {
              ...facet,
              values: facet.values.map((value, index: number) =>
                index === 0 ? {...value, state: 'selected'} : value
              ),
            };
          }
          return facet;
        }
      );
      return {
        ...response,
        facets: selectedFacets,
      };
    });
  },
};

export const Collapsed: Story = {
  tags: ['test'],
  args: {
    field: 'objecttype',
    'is-collapsed': true,
  },
  decorators: [facetDecorator],
  beforeEach: () => {
    mockDefaultFacetResponse();
  },
};

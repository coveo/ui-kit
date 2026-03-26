import type {Meta, StoryObj as Story} from '@storybook/web-components-vite';
import {getStorybookHelpers} from '@wc-toolkit/storybook-helpers';
import {testInteractiveA11y} from '@/storybook-utils/a11y/';
import {MockSearchApi} from '@/storybook-utils/api/search/mock';
import {parameters} from '@/storybook-utils/common/common-meta-parameters';
import {facetDecorator} from '@/storybook-utils/common/facets-decorator';
import {wrapInSearchInterface} from '@/storybook-utils/search/search-interface-wrapper';

const mockSearchApi = new MockSearchApi();

const {decorator, play} = wrapInSearchInterface();
const {events, args, argTypes, template} = getStorybookHelpers(
  'atomic-rating-facet',
  {excludeCategories: ['methods']}
);

const meta: Meta = {
  component: 'atomic-rating-facet',
  title: 'Search/RatingFacet',
  id: 'atomic-rating-facet',
  render: (args) => template(args),
  decorators: [decorator],
  parameters: {
    ...parameters,
    actions: {
      handles: events,
    },
    msw: {handlers: [...mockSearchApi.handlers]},
  },
  argTypes: {
    ...argTypes,
    'tabs-included': {
      control: {type: 'object'},
    },
    'tabs-excluded': {
      control: {type: 'object'},
    },
    'depends-on': {
      control: {type: 'object'},
    },
    'allowed-values': {
      control: {type: 'object'},
    },
  },

  play,
  args: {
    ...args,
    'number-of-values': 8,
    'tabs-included': '[]',
    'tabs-excluded': '[]',
    'allowed-values': '[]',
    'depends-on': '{}',
  },
  beforeEach: () => {
    mockSearchApi.searchEndpoint.clear();
  },
};

export default meta;

export const Default: Story = {
  args: {
    field: 'snrating',
  },
  decorators: [facetDecorator],
};

export const DisplayAsLink: Story = {
  name: 'With display as link',
  tags: ['test'],
  args: {
    'display-values-as': 'link',
    field: 'snrating',
  },
  decorators: [facetDecorator],
};

export const A11yInteraction: Story = {
  tags: ['!dev'],
  args: {
    field: 'snrating',
  },
  decorators: [facetDecorator],
  beforeEach: () => {
    mockSearchApi.searchEndpoint.mock((response) => ({
      ...response,
      facets: [
        {
          facetId: 'snrating',
          field: 'snrating',
          moreValuesAvailable: false,
          values: [
            {
              start: 5,
              end: 6,
              endInclusive: false,
              state: 'idle',
              numberOfResults: 13,
            },
            {
              start: 4,
              end: 5,
              endInclusive: false,
              state: 'idle',
              numberOfResults: 6,
            },
            {
              start: 3,
              end: 4,
              endInclusive: false,
              state: 'idle',
              numberOfResults: 17,
            },
            {
              start: 2,
              end: 3,
              endInclusive: false,
              state: 'idle',
              numberOfResults: 6,
            },
            {
              start: 1,
              end: 2,
              endInclusive: false,
              state: 'idle',
              numberOfResults: 3,
            },
          ],
          domain: {start: 1.0, end: 5.0},
        },
      ],
    }));
  },
  play: async (context) => {
    await play(context);
    await testInteractiveA11y(context, {});
  },
};

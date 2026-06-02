import type {Meta, StoryObj as Story} from '@storybook/web-components-vite';
import {getStorybookHelpers} from '@wc-toolkit/storybook-helpers';
import {testStatusMessageA11y} from '@/storybook-utils/a11y/status-message.js';
import {parameters} from '@/storybook-utils/common/common-meta-parameters';
import {facetDecorator} from '@/storybook-utils/common/facets-decorator';
import {MockSearchApi} from '@/storybook-utils/api/search/mock';
import {
  searchFacetTransformer,
  searchFacetSearchTransformer,
} from '@/storybook-utils/api/search/facet-transformer';
import {wrapInSearchInterface} from '@/storybook-utils/search/search-interface-wrapper';
import '@/src/components/search/atomic-rating-range-facet/atomic-rating-range-facet.js';

const searchApiHarness = new MockSearchApi();
searchApiHarness.searchEndpoint.addRequestTransformer(searchFacetTransformer);
searchApiHarness.facetSearchEndpoint.addRequestTransformer(
  searchFacetSearchTransformer
);

const {decorator, play} = wrapInSearchInterface();
const {events, args, argTypes, template} = getStorybookHelpers(
  'atomic-rating-range-facet',
  {excludeCategories: ['methods']}
);

const meta: Meta = {
  component: 'atomic-rating-range-facet',
  title: 'Search/RatingRangeFacet',
  id: 'atomic-rating-range-facet',
  render: (args) => template(args),
  decorators: [decorator],
  parameters: {
    ...parameters,
    chromatic: {disableSnapshot: true},
    msw: {
      handlers: [...searchApiHarness.handlers],
    },
    actions: {
      handles: events,
    },
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
};

export default meta;

export const Default: Story = {
  name: 'atomic-rating-range-facet',
  args: {
    field: 'snrating',
  },
  decorators: [facetDecorator],
};

export const A11yStatusMessage: Story = {
  name: 'A11y Status Message',
  tags: ['a11y', 'test', '!dev'],
  args: {
    field: 'snrating',
  },
  decorators: [facetDecorator],
  play: async (context) => {
    await play(context);
    await testStatusMessageA11y(context, {
      triggerAction: async () => {
        const link = await context.canvas.findByShadowRole('link', {
          name: /\d/,
        });
        link.click();
      },
      expectedText: /results/i,
      timeout: 10000,
    });
  },
};

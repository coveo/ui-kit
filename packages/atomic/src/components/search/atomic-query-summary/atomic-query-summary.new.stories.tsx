import type {Meta, StoryObj as Story} from '@storybook/web-components-vite';
import {getStorybookHelpers} from '@wc-toolkit/storybook-helpers';
import {testStatusMessageA11y} from '@/storybook-utils/a11y/status-message.js';
import {parameters} from '@/storybook-utils/common/common-meta-parameters';
import {MockSearchApi} from '@coveo/platform-mock-api/search/mock';
import {
  searchFacetTransformer,
  searchFacetSearchTransformer,
} from '@coveo/platform-mock-api/search/facet-transformer';
import {wrapInSearchInterface} from '@/storybook-utils/search/search-interface-wrapper';
import '@/src/components/search/atomic-query-summary/atomic-query-summary.js';

const searchApiHarness = new MockSearchApi();
searchApiHarness.searchEndpoint.addRequestTransformer(searchFacetTransformer);
searchApiHarness.facetSearchEndpoint.addRequestTransformer(searchFacetSearchTransformer);

const {decorator, play} = wrapInSearchInterface();
const {events, args, argTypes, template} = getStorybookHelpers('atomic-query-summary', {
  excludeCategories: ['methods'],
});

const meta: Meta = {
  component: 'atomic-query-summary',
  title: 'Search/Query Summary',
  id: 'atomic-query-summary',

  render: (args) => template(args),
  decorators: [decorator],
  parameters: {
    ...parameters,
    msw: {handlers: [...searchApiHarness.handlers]},
    actions: {
      handles: events,
    },
  },
  args,
  argTypes,

  play,
};

export default meta;

export const Default: Story = {
  name: 'Default',
};

export const A11yStatusMessage: Story = {
  name: 'A11y Status Message',
  tags: ['a11y', 'test', '!dev'],
  play: async (context) => {
    await play(context);
    await testStatusMessageA11y(context, {
      triggerAction: async () => {
        // Search is already triggered by play() — query-summary announces
        // results count via AriaLiveRegionController.
      },
      expectedText: /results/i,
      timeout: 10000,
    });
  },
};

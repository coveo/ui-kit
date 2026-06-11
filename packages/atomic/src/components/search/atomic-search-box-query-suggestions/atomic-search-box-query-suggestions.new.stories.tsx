import type {Meta, StoryObj as Story} from '@storybook/web-components-vite';
import {getStorybookHelpers} from '@wc-toolkit/storybook-helpers';
import {html} from 'lit';
import {userEvent} from 'storybook/test';
import {testStatusMessageA11y} from '@/storybook-utils/a11y/status-message.js';
import {parameters} from '@/storybook-utils/common/common-meta-parameters';
import {MockSearchApi} from '@/storybook-utils/api/search/mock';
import {
  searchFacetTransformer,
  searchFacetSearchTransformer,
} from '@/storybook-utils/api/search/facet-transformer';
import {wrapInSearchInterface} from '@/storybook-utils/search/search-interface-wrapper';
import '@/src/components/search/atomic-search-box/atomic-search-box.js';
import '@/src/components/search/atomic-search-box-query-suggestions/atomic-search-box-query-suggestions.js';

const searchApiHarness = new MockSearchApi();
searchApiHarness.searchEndpoint.addRequestTransformer(searchFacetTransformer);
searchApiHarness.facetSearchEndpoint.addRequestTransformer(
  searchFacetSearchTransformer
);

const {decorator, play} = wrapInSearchInterface();
const {events, args, argTypes, template} = getStorybookHelpers(
  'atomic-search-box-query-suggestions',
  {excludeCategories: ['methods']}
);

const meta: Meta = {
  component: 'atomic-search-box-query-suggestions',
  title: 'Search/Search Box Query Suggestions',
  id: 'atomic-search-box-query-suggestions',
  render: (args) => template(args),
  decorators: [
    (story) => html`<atomic-search-box> ${story()} </atomic-search-box>`,
    decorator,
  ],
  parameters: {
    ...parameters,
    chromatic: {disableSnapshot: true},
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
  name: 'atomic-search-box-query-suggestions',
};

export const A11yStatusMessage: Story = {
  name: 'A11y Status Message',
  tags: ['a11y', 'test', '!dev'],
  play: async (context) => {
    await play(context);
    await testStatusMessageA11y(context, {
      triggerAction: async () => {
        const searchBox =
          await context.canvas.findByShadowPlaceholderText('Search');
        await userEvent.click(searchBox);
      },
      expectedText: '5 search suggestions are available.',
      timeout: 5000,
    });
  },
};

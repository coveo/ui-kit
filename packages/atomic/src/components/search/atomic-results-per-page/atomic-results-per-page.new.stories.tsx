import type {Meta, StoryObj as Story} from '@storybook/web-components-vite';
import {getStorybookHelpers} from '@wc-toolkit/storybook-helpers';
import {html} from 'lit';
import {testStatusMessageA11y} from '@/storybook-utils/a11y/status-message.js';
import {parameters} from '@/storybook-utils/common/common-meta-parameters';
import {MockSearchApi} from '@/storybook-utils/api/search/mock';
import {searchFacetTransformer} from '@/storybook-utils/api/search/facet-transformer';
import {wrapInSearchInterface} from '@/storybook-utils/search/search-interface-wrapper';
import '@/src/components/search/atomic-results-per-page/atomic-results-per-page.js';
import '@/src/components/search/atomic-query-summary/atomic-query-summary.js';

const searchApiHarness = new MockSearchApi();
searchApiHarness.searchEndpoint.addRequestTransformer(searchFacetTransformer);

const {decorator, play} = wrapInSearchInterface();
const {events, args, argTypes, template} = getStorybookHelpers(
  'atomic-results-per-page',
  {excludeCategories: ['methods']}
);

const meta: Meta = {
  component: 'atomic-results-per-page',
  title: 'Search/Results Per Page',
  id: 'atomic-results-per-page',

  render: (args) => template(args),
  decorators: [decorator],
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

export const Default: Story = {};

export const A11yStatusMessage: Story = {
  name: 'A11y Status Message',
  tags: ['a11y', 'test', '!dev'],
  decorators: [
    (story) => html`
      <atomic-query-summary></atomic-query-summary>
      ${story()}
    `,
  ],
  play: async (context) => {
    await play(context);
    await testStatusMessageA11y(context, {
      triggerAction: async () => {
        const radio = await context.canvas.findByShadowLabelText('25');
        radio.click();
      },
      expectedText: /Results \d+-\d+ of \d+/i,
      timeout: 1000,
    });
  },
};

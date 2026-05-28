import type {Meta, StoryObj as Story} from '@storybook/web-components-vite';
import {getStorybookHelpers} from '@wc-toolkit/storybook-helpers';
import {html} from 'lit';
import {within} from 'shadow-dom-testing-library';

import {testStatusMessageA11y} from '@/storybook-utils/a11y/status-message.js';
import {MockSearchApi} from '@/storybook-utils/api/search/mock';
import {parameters} from '@/storybook-utils/common/common-meta-parameters';
import {wrapInSearchInterface} from '@/storybook-utils/search/search-interface-wrapper';
import '@/src/components/search/atomic-load-more-results/atomic-load-more-results.js';
import '@/src/components/search/atomic-query-summary/atomic-query-summary.js';

const searchApiHarness = new MockSearchApi();

const {decorator, play} = wrapInSearchInterface();
const {events, args, argTypes, template} = getStorybookHelpers(
  'atomic-load-more-results',
  {excludeCategories: ['methods']}
);

const meta: Meta = {
  component: 'atomic-load-more-results',
  title: 'Search/LoadMoreResults',
  id: 'atomic-load-more-results',
  render: (args) => template(args),
  decorators: [decorator],
  parameters: {
    ...parameters,
    actions: {
      handles: events,
    },
    msw: {
      handlers: [...searchApiHarness.handlers],
    },
  },
  args,
  argTypes,
  beforeEach: () => {
    searchApiHarness.searchEndpoint.clear();
    searchApiHarness.searchEndpoint.mockOnce((response) =>
      'results' in response
        ? {
            ...response,
            results: response.results.slice(0, 40),
          }
        : response
    );
    searchApiHarness.searchEndpoint.mockOnce((response) =>
      'results' in response
        ? {
            ...response,
            results: response.results.slice(40, 80),
          }
        : response
    );
    searchApiHarness.searchEndpoint.mockOnce((response) =>
      'results' in response
        ? {
            ...response,
            results: response.results.slice(80),
          }
        : response
    );
  },
  play,
};

export default meta;

export const Default: Story = {};

export const A11yStatusMessage: Story = {
  name: 'A11y Status Message',
  tags: ['a11y', 'test', '!dev'],
  decorators: [
    (story) => html`<atomic-query-summary></atomic-query-summary>${story()}`,
  ],
  play: async (context) => {
    await play(context);
    await testStatusMessageA11y(context, {
      triggerAction: async () => {
        const canvas = within(context.canvasElement);
        const button = await canvas.findByShadowRole('button', {
          name: 'Load more results',
        });
        button.click();
      },
      expectedText: 'Results loaded. Results 1-80 of 120',
      timeout: 5000,
    });
  },
};

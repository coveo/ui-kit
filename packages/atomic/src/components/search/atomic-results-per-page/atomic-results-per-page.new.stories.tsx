import type {Meta, StoryObj as Story} from '@storybook/web-components-vite';
import {getStorybookHelpers} from '@wc-toolkit/storybook-helpers';
import {html} from 'lit';
import {within} from 'shadow-dom-testing-library';
import {testStatusMessageA11y} from '@/storybook-utils/a11y/status-message.js';
import {MockSearchApi} from '@/storybook-utils/api/search/mock';
import {buildSearchResponseWithResults} from '@/storybook-utils/api/search/search-response-mocks';
import {parameters} from '@/storybook-utils/common/common-meta-parameters';
import {wrapInSearchInterface} from '@/storybook-utils/search/search-interface-wrapper';
import '@/src/components/search/atomic-query-summary/atomic-query-summary.js';
import '@/src/components/search/atomic-results-per-page/atomic-results-per-page.js';

const mockSearchApi = new MockSearchApi();

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
    msw: {handlers: [...mockSearchApi.handlers]},
    actions: {
      handles: events,
    },
  },
  args,
  argTypes,
  beforeEach: async () => {
    mockSearchApi.clearAll();
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
  beforeEach: async () => {
    mockSearchApi.searchEndpoint.mockOnce(buildSearchResponseWithResults(120));
    mockSearchApi.searchEndpoint.mockOnce(
      buildSearchResponseWithResults(120, 25)
    );
  },
  play: async (context) => {
    await play(context);
    await testStatusMessageA11y(context, {
      triggerAction: async () => {
        const canvas = within(context.canvasElement);
        const button = await canvas.findByShadowRole('radio', {name: '25'});
        button.click();
      },
      expectedText: 'Results loaded. Results 1-25 of 120',
      timeout: 5000,
    });
  },
};

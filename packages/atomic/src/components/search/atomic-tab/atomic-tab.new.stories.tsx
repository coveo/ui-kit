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
import '@/src/components/search/atomic-tab/atomic-tab.js';
import '@/src/components/search/atomic-tab-manager/atomic-tab-manager.js';

const mockSearchApi = new MockSearchApi();
const {decorator, play} = wrapInSearchInterface();

const {events, argTypes} = getStorybookHelpers('atomic-tab', {
  excludeCategories: ['methods'],
});

const meta: Meta = {
  component: 'atomic-tab',
  title: 'Search/Tab',
  id: 'atomic-tab',
  render: () =>
    html`<atomic-tab-manager>
      <atomic-tab label="All" name="all"></atomic-tab>
      <atomic-tab label="Images" name="images"></atomic-tab>
      <atomic-tab label="Articles" name="articles"></atomic-tab>
    </atomic-tab-manager>`,
  decorators: [decorator],
  parameters: {
    ...parameters,
    chromatic: {disableSnapshot: true},
    actions: {
      handles: events,
    },
    msw: {handlers: [...mockSearchApi.handlers]},
  },
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
    mockSearchApi.searchEndpoint.mockOnce(buildSearchResponseWithResults(42));
  },
  play: async (context) => {
    await play(context);
    await testStatusMessageA11y(context, {
      triggerAction: async () => {
        const canvas = within(context.canvasElement);
        const button = await canvas.findByShadowRole('button', {
          name: 'Images',
        });
        button.click();
      },
      expectedText: 'Results loaded. Results 1-10 of 42',
      timeout: 5000,
    });
  },
};

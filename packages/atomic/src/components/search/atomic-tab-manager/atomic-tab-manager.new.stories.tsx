import type {Decorator, Meta, StoryObj as Story} from '@storybook/web-components-vite';
import {getStorybookHelpers} from '@wc-toolkit/storybook-helpers';
import {html} from 'lit';
import {within} from 'shadow-dom-testing-library';
import {testStatusMessageA11y} from '@/storybook-utils/a11y/status-message.js';
import {testTabsA11y} from '@/storybook-utils/a11y/tabs.js';
import {MockSearchApi} from '@coveo/platform-mock-api/search/mock';
import {buildSearchResponseWithResults} from '@coveo/platform-mock-api/search/search-response-mocks';
import {parameters} from '@/storybook-utils/common/common-meta-parameters';
import {wrapInSearchInterface} from '@/storybook-utils/search/search-interface-wrapper';
import '@/src/components/search/atomic-tab/atomic-tab.js';
import '@/src/components/search/atomic-tab-manager/atomic-tab-manager.js';
import '@/src/components/search/atomic-query-summary/atomic-query-summary.js';

const searchApiHarness = new MockSearchApi();

const {decorator, play} = wrapInSearchInterface();

const {events, args, argTypes, template} = getStorybookHelpers('atomic-tab-manager', {
  excludeCategories: ['methods'],
});

const widthDecorator: Decorator = (story) => html`<div style="min-width: 350px;">${story()}</div> `;

const meta: Meta = {
  component: 'atomic-tab-manager',
  title: 'Search/Tab Manager',
  id: 'atomic-tab-manager',
  render: (args) => template(args),
  decorators: [widthDecorator, decorator],
  parameters: {
    ...parameters,
    actions: {
      handles: events,
    },
    msw: {handlers: [...searchApiHarness.handlers]},
  },
  argTypes,
  args: {
    ...args,
    'default-slot': `
          <atomic-tab
            label="All"
            name="all"
          ></atomic-tab>
          <atomic-tab
            label="Documentation"
            name="documentation"
          ></atomic-tab>
          <atomic-tab
            label="Articles"
            name="articles"
          ></atomic-tab>`,
  },
  play,
  beforeEach: async () => {
    searchApiHarness.clearAll();
  },
};

export default meta;

export const Default: Story = {};

export const A11yTabs: Story = {
  tags: ['a11y', 'test', '!dev'],
  play: async (context) => {
    await play(context);
    await testTabsA11y(context);
  },
};

export const A11yStatusMessage: Story = {
  name: 'A11y Status Message',
  tags: ['a11y', 'test', '!dev'],
  decorators: [
    (story) => html`
      <atomic-query-summary></atomic-query-summary>
      ${story()}
    `,
  ],
  beforeEach: async () => {
    searchApiHarness.searchEndpoint.mockOnce(buildSearchResponseWithResults(120));
    searchApiHarness.searchEndpoint.mockOnce(buildSearchResponseWithResults(42));
  },
  play: async (context) => {
    await play(context);
    await testStatusMessageA11y(context, {
      triggerAction: async () => {
        const canvas = within(context.canvasElement);
        const tab = await canvas.findByShadowRole('tab', {
          name: 'Documentation',
        });
        tab.click();
      },
      expectedText: 'Results loaded. Results 1-10 of 42',
      timeout: 5000,
    });
  },
};

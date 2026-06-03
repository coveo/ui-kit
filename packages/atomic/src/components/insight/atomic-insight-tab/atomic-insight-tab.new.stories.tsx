import type {Meta, StoryObj as Story} from '@storybook/web-components-vite';
import {html} from 'lit';
import {testTabsA11y} from '@/storybook-utils/a11y/tabs.js';
import {MockInsightApi} from '@/storybook-utils/api/insight/mock';
import {parameters} from '@/storybook-utils/common/common-meta-parameters';
import {wrapInInsightInterface} from '@/storybook-utils/insight/insight-interface-wrapper';
import '@/src/components/insight/atomic-insight-tab/atomic-insight-tab.js';
import '@/src/components/insight/atomic-insight-tabs/atomic-insight-tabs.js';

const mockedInsightApi = new MockInsightApi();

const {decorator, play} = wrapInInsightInterface();

const meta: Meta = {
  component: 'atomic-insight-tab',
  title: 'Insight/Tab',
  id: 'atomic-insight-tab',
  render: () => html`<atomic-insight-tabs>
    <atomic-insight-tab label="All" expression="" active></atomic-insight-tab>
    <atomic-insight-tab
      label="Videos"
      expression="@ytchanneltitle"
    ></atomic-insight-tab>
    <atomic-insight-tab
      label="Articles"
      expression='@documenttype==("WebPage")'
    ></atomic-insight-tab>
  </atomic-insight-tabs>`,
  decorators: [decorator],
  parameters: {
    ...parameters,
    chromatic: {disableSnapshot: true},
    actions: {},
    msw: {
      handlers: [...mockedInsightApi.handlers],
    },
  },
  beforeEach: () => {
    mockedInsightApi.searchEndpoint.clear();
    mockedInsightApi.querySuggestEndpoint.clear();
  },
  play,
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

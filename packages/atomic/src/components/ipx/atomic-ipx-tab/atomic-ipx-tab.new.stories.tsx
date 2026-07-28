import type {Meta, StoryObj as Story} from '@storybook/web-components-vite';
import {html} from 'lit';
import {testTabsA11y} from '@/storybook-utils/a11y/tabs.js';
import {MockSearchApi} from '@coveo/platform-mock-api/search/mock';
import {parameters} from '@/storybook-utils/common/common-meta-parameters';
import {wrapInSearchInterface} from '@/storybook-utils/search/search-interface-wrapper';
import '@/src/components/ipx/atomic-ipx-tab/atomic-ipx-tab.js';
import '@/src/components/ipx/atomic-ipx-tabs/atomic-ipx-tabs.js';

const mockSearchApi = new MockSearchApi();

const {decorator, play} = wrapInSearchInterface();

const meta: Meta = {
  component: 'atomic-ipx-tab',
  title: 'IPX/Tab',
  id: 'atomic-ipx-tab',
  render: () => html`<atomic-ipx-tabs>
    <atomic-ipx-tab label="All" expression="" active></atomic-ipx-tab>
    <atomic-ipx-tab label="Videos" expression="@ytchanneltitle"></atomic-ipx-tab>
    <atomic-ipx-tab label="Articles" expression='@documenttype==("WebPage")'></atomic-ipx-tab>
  </atomic-ipx-tabs>`,
  decorators: [decorator],
  parameters: {
    ...parameters,
    actions: {},
    msw: {
      handlers: [...mockSearchApi.handlers],
    },
  },
  beforeEach: () => {
    mockSearchApi.searchEndpoint.clear();
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

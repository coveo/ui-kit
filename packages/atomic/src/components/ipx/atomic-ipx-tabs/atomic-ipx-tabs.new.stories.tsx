import type {Meta, StoryObj as Story} from '@storybook/web-components-vite';
import {html} from 'lit';
import {MockSearchApi} from '@/storybook-utils/api/search/mock';
import {wrapInSearchInterface} from '@/storybook-utils/search/search-interface-wrapper';

const mockSearchApi = new MockSearchApi();

const {decorator, play} = wrapInSearchInterface();

const meta: Meta = {
  component: 'atomic-ipx-tabs',
  title: 'IPX/IPX Tabs',
  id: 'atomic-ipx-tabs',
  render: () => html`<atomic-ipx-tabs>
    <atomic-ipx-tab label="All" name="all" expression=""></atomic-ipx-tab>
    <atomic-ipx-tab
      label="Documentation"
      name="documentation"
      expression="@source=documentation"
    ></atomic-ipx-tab>
    <atomic-ipx-tab
      label="Articles"
      name="articles"
      expression="@source=articles"
    ></atomic-ipx-tab>
  </atomic-ipx-tabs>`,
  decorators: [decorator],
  parameters: {
    msw: {handlers: [...mockSearchApi.handlers]},
  },
  play,
  beforeEach: async () => {
    mockSearchApi.searchEndpoint.clear();
  },
};

export default meta;

export const Default: Story = {};

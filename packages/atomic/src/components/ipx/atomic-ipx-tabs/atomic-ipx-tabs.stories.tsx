import type {Meta, StoryObj as Story} from '@storybook/web-components';
import {html} from 'lit-html';

const meta: Meta = {
  component: 'atomic-ipx-tabs',
  title: 'Atomic/IPX/IPXTabs',
  id: 'atomic-ipx-tabs',
};

export default meta;

export const Default: Story = {
  render: () => html`
    <atomic-search-interface>
      <atomic-ipx-tabs>
        <atomic-ipx-tab label="All" expression=""></atomic-ipx-tab>
        <atomic-ipx-tab label="Documentation" expression="@source=documentation"></atomic-ipx-tab>
        <atomic-ipx-tab label="Articles" expression="@source=articles"></atomic-ipx-tab>
      </atomic-ipx-tabs>
    </atomic-search-interface>
  `,
};

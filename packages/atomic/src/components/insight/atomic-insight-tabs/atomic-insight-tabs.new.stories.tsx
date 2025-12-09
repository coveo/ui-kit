import type {Meta, StoryObj as Story} from '@storybook/web-components-vite';
import {html} from 'lit/static-html.js';
import {wrapInInsightInterface} from '@/storybook-utils/insight/insight-interface-wrapper';

const {decorator, play} = wrapInInsightInterface();

const meta: Meta = {
  component: 'atomic-insight-tabs',
  title: 'Insight/AtomicInsightTabs',
  id: 'atomic-insight-tabs',
  decorators: [decorator],
  play,
  render: () => html`
    <atomic-insight-tabs>
      <atomic-insight-tab
        label="All"
        expression=""
        active="true"
      ></atomic-insight-tab>
      <atomic-insight-tab
        label="Videos"
        expression="@ytchanneltitle"
      ></atomic-insight-tab>
      <atomic-insight-tab
        label="Documentation"
        expression='@documenttype==("WebPage")'
      ></atomic-insight-tab>
    </atomic-insight-tabs>
  `,
};

export default meta;

/**
 * The default story shows the tabs component with three tabs.
 * This component is a simple wrapper that renders its slotted tab elements.
 */
export const Default: Story = {};

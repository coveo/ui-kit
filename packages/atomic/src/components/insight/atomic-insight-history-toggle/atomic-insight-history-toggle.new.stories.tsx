import {html} from 'lit';
import {wrapInInsightInterface} from '@/storybook-utils/insight/insight-interface-wrapper';
import './atomic-insight-history-toggle';
import type {Meta, StoryObj as Story} from '@storybook/web-components-vite';

const {decorator, play} = wrapInInsightInterface();

const meta: Meta = {
  component: 'atomic-insight-history-toggle',
  title: 'Insight/History Toggle',
  id: 'atomic-insight-history-toggle',
  decorators: [decorator],
  play,
  argTypes: {
    tooltip: {
      control: 'text',
      description: 'The tooltip text to display on hover',
      table: {
        defaultValue: {summary: ''},
      },
    },
  },
  args: {
    tooltip: '',
  },
  render: (args) =>
    html`<atomic-insight-history-toggle
      .tooltip=${args.tooltip}
      .clickCallback=${() => alert('History button clicked!')}
    ></atomic-insight-history-toggle>`,
};

export default meta;

export const Default: Story = {};

export const WithTooltip: Story = {
  args: {
    tooltip: 'View history',
  },
};

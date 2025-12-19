import type {Meta, StoryObj as Story} from '@storybook/web-components';
import {html} from 'lit';
import {wrapInInsightInterface} from '@/storybook-utils/insight/insight-interface-wrapper';
import './atomic-insight-edit-toggle';

const {decorator, play} = wrapInInsightInterface({
  skipFirstSearch: true,
});

const meta: Meta = {
  component: 'atomic-insight-edit-toggle',
  title: 'Insight/InsightEditToggle',
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
    html`<atomic-insight-edit-toggle
      .tooltip=${args.tooltip}
      .clickCallback=${() => alert('Edit button clicked!')}
    ></atomic-insight-edit-toggle>`,
};

export default meta;

export const Default: Story = {};

export const WithTooltip: Story = {
  args: {
    tooltip: 'Click to edit this item',
  },
};

export const WithLongTooltip: Story = {
  args: {
    tooltip:
      'Click here to edit and customize this item according to your preferences',
  },
};

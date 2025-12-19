import {html} from 'lit';
import {wrapInInsightInterface} from '@/storybook-utils/insight/insight-interface-wrapper';
import './atomic-insight-edit-toggle';
import type {Meta, StoryObj as Story} from '@storybook/web-components-vite';

const {decorator, play} = wrapInInsightInterface();

const meta: Meta = {
  component: 'atomic-insight-edit-toggle',
  title: 'Insight/Edit Toggle',
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

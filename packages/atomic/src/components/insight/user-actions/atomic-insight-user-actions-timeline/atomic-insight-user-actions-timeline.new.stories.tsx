import type {Meta, StoryObj as Story} from '@storybook/web-components';
import {parameters} from '@/storybook-utils/common/common-meta-parameters';
import {renderComponent} from '@/storybook-utils/common/render-component';
import {wrapInInsightInterface} from '@/storybook-utils/insight/insight-interface-wrapper';

const {decorator, play} = wrapInInsightInterface();

const meta: Meta = {
  component: 'atomic-insight-user-actions-timeline',
  title: 'Insight/UserActionsTimeline',
  id: 'atomic-insight-user-actions-timeline',

  render: renderComponent,
  decorators: [decorator],
  parameters,
  argTypes: {
    'attributes-user-id': {
      control: {
        type: 'text',
      },
      description: 'The ID of the user whose actions are being displayed.',
      table: {
        category: 'attributes',
        type: {
          summary: 'string',
        },
        defaultValue: {},
      },
    },
    'attributes-ticket-creation-date-time': {
      control: {
        type: 'text',
      },
      description: 'The date and time when the case was created.',
      table: {
        category: 'attributes',
        type: {
          summary: 'string',
        },
        defaultValue: {},
      },
    },
  },
  play,
};

export default meta;

export const Default: Story = {
  name: 'atomic-insight-user-actions-timeline',
  play: async (context) => {
    await play(context);
  },
};

import {parameters} from '@coveo/atomic/storybookUtils/common/common-meta-parameters';
import {renderComponent} from '@coveo/atomic/storybookUtils/common/render-component';
import type {Meta, StoryObj as Story} from '@storybook/web-components';
import {wrapInInsightInterface} from '../../../../../storybookUtils/insight/insight-interface-wrapper';

const {decorator, play} = wrapInInsightInterface();

const meta: Meta = {
  component: 'atomic-insight-user-actions-toggle',
  title: 'Atomic/Insight/UserActionsToggle',
  id: 'atomic-insight-user-actions-toggle',

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
  name: 'atomic-insight-user-actions-toggle',
  play: async (context) => {
    await play(context);
  },
};

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
  play,
};

export default meta;

export const Default: Story = {
  name: 'atomic-insight-user-actions-toggle',
  play: async (context) => {
    await play(context);
  },
};

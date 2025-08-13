import type {Meta, StoryObj as Story} from '@storybook/web-components-vite';
import {getStorybookHelpers} from '@wc-toolkit/storybook-helpers';
import {parameters} from '@/storybook-utils/common/common-meta-parameters';
import {wrapInInsightInterface} from '@/storybook-utils/insight/insight-interface-wrapper';

const {decorator, play} = wrapInInsightInterface();
const {events, args, argTypes, template} = getStorybookHelpers(
  'atomic-insight-user-actions-toggle',
  {excludeCategories: ['methods']}
);

const meta: Meta = {
  component: 'atomic-insight-user-actions-toggle',
  title: 'Insight/UserActionsToggle',
  id: 'atomic-insight-user-actions-toggle',

  render: (args) => template(args),
  decorators: [decorator],
  parameters: {
    ...parameters,
    actions: {
      handles: events,
    },
  },
  args,
  argTypes,
  play,
};

export default meta;

export const Default: Story = {
  name: 'atomic-insight-user-actions-toggle',
};

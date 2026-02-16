import type {Meta, StoryObj as Story} from '@storybook/web-components-vite';
import {getStorybookHelpers} from '@wc-toolkit/storybook-helpers';
import {parameters} from '@/storybook-utils/common/common-meta-parameters';

const {events, args, argTypes, template} = getStorybookHelpers(
  'atomic-focus-trap',
  {excludeCategories: ['methods']}
);

const meta: Meta = {
  component: 'atomic-focus-trap',
  title: 'Common/Focus Trap',
  id: 'atomic-focus-trap',
  render: (args) => template(args),
  parameters: {
    ...parameters,
    actions: {
      handles: events,
    },
  },
  args,
  argTypes,
};

export default meta;

export const Default: Story = {
  tags: ['!dev'],
};

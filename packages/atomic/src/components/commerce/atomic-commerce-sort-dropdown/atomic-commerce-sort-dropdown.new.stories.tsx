import type {Meta, StoryObj as Story} from '@storybook/web-components-vite';
import {getStorybookHelpers} from '@wc-toolkit/storybook-helpers';
import {wrapInCommerceInterface} from '@/storybook-utils/commerce/commerce-interface-wrapper';
import {parameters} from '@/storybook-utils/common/common-meta-parameters';

const {decorator, play} = wrapInCommerceInterface();
const {events, args, argTypes, template} = getStorybookHelpers(
  'atomic-commerce-sort-dropdown',
  {excludeCategories: ['methods']}
);

const meta: Meta = {
  component: 'atomic-commerce-sort-dropdown',
  title: 'Commerce/Sort Dropdown',
  id: 'atomic-commerce-sort-dropdown',
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

export const Default: Story = {};

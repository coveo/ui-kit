import type {Meta, StoryObj as Story} from '@storybook/web-components-vite';
import {getStorybookHelpers} from '@wc-toolkit/storybook-helpers';
import {wrapInCommerceInterface} from '@/storybook-utils/commerce/commerce-interface-wrapper';
import {parameters} from '@/storybook-utils/common/common-meta-parameters';

const {decorator, play} = wrapInCommerceInterface({
  skipFirstRequest: false,
});

const {events, args, argTypes, template} = getStorybookHelpers(
  'atomic-commerce-query-summary',
  {excludeCategories: ['methods']}
);

const meta: Meta = {
  component: 'atomic-commerce-query-summary',
  title: 'Commerce/Query Summary',
  id: 'atomic-commerce-query-summary',
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

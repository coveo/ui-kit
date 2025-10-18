import type {Meta, StoryObj as Story} from '@storybook/web-components-vite';
import {getStorybookHelpers} from '@wc-toolkit/storybook-helpers';
import {wrapInCommerceInterface} from '@/storybook-utils/commerce/commerce-interface-wrapper';
import {parameters} from '@/storybook-utils/common/common-meta-parameters';

const {decorator, play} = wrapInCommerceInterface();
const {events, args, argTypes, template} = getStorybookHelpers(
  'atomic-commerce-products-per-page',
  {excludeCategories: ['methods']}
);

const meta: Meta = {
  component: 'atomic-commerce-products-per-page',
  title: 'Commerce/Products Per Page',
  id: 'atomic-commerce-products-per-page',
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

export const WithCustomChoicesDisplayed: Story = {
  name: 'With custom choices displayed',
  args: {
    'choices-displayed': '2,5,10,25',
    'initial-choice': '2',
  },
};

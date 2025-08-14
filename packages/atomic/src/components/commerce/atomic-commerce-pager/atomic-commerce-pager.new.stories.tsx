import type {Meta, StoryObj as Story} from '@storybook/web-components-vite';
import {getStorybookHelpers} from '@wc-toolkit/storybook-helpers';
import {wrapInCommerceInterface} from '@/storybook-utils/commerce/commerce-interface-wrapper';
import {parameters} from '@/storybook-utils/common/common-meta-parameters';

const {decorator, play} = wrapInCommerceInterface();
const {events, args, argTypes, template} = getStorybookHelpers(
  'atomic-commerce-pager',
  {excludeCategories: ['methods']}
);

const meta: Meta = {
  component: 'atomic-commerce-pager',
  title: 'Commerce/Pager',
  id: 'atomic-commerce-pager',
  render: (args) => template(args),
  decorators: [decorator],
  parameters: {
    ...parameters,
    actions: {
      handles: events,
    },
  },
  args: {
    ...args,
    'number-of-pages': '5',
  },
  argTypes,
  afterEach: play,
};

export default meta;

export const Default: Story = {};

export const CustomIcon: Story = {
  name: 'With custom icons',
  args: {
    'previous-button-icon':
      'https://raw.githubusercontent.com/coveo/ui-kit/main/packages/atomic/src/images/arrow-top-rounded.svg',
    previousButtonIcon:
      'https://raw.githubusercontent.com/coveo/ui-kit/main/packages/atomic/src/images/arrow-top-rounded.svg',
    nextButtonIcon:
      'https://raw.githubusercontent.com/coveo/ui-kit/main/packages/atomic/src/images/arrow-top-rounded.svg',
    'next-button-icon':
      'https://raw.githubusercontent.com/coveo/ui-kit/main/packages/atomic/src/images/arrow-top-rounded.svg',
  },
};

export const WithACustomNumberOfPages: Story = {
  name: 'With a custom number of pages',
  args: {
    numberOfPages: '10',
  },
};

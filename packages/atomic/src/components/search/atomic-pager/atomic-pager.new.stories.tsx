import type {Meta, StoryObj as Story} from '@storybook/web-components-vite';
import {getStorybookHelpers} from '@wc-toolkit/storybook-helpers';
import {parameters} from '@/storybook-utils/common/common-meta-parameters';
import {wrapInSearchInterface} from '@/storybook-utils/search/search-interface-wrapper';

const {decorator, afterEach} = wrapInSearchInterface();
const {events, args, argTypes, template} = getStorybookHelpers('atomic-pager', {
  excludeCategories: ['methods'],
});

const meta: Meta = {
  component: 'atomic-pager',
  title: 'Search/Pager',
  id: 'atomic-pager',

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

  afterEach,
};

export default meta;

export const Default: Story = {};

export const CustomIcon: Story = {
  name: 'With custom icons',
  args: {
    'previous-button-icon':
      'https://raw.githubusercontent.com/coveo/ui-kit/main/packages/atomic/src/images/arrow-top-rounded.svg',
    'next-button-icon':
      'https://raw.githubusercontent.com/coveo/ui-kit/main/packages/atomic/src/images/arrow-top-rounded.svg',
  },
};

export const WithACustomNumberOfPages: Story = {
  name: 'With a custom number of pages',
  args: {
    'number-of-pages': '10',
  },
};

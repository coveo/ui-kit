import type {Meta, StoryObj as Story} from '@storybook/web-components-vite';
import {getStorybookHelpers} from '@wc-toolkit/storybook-helpers';
import {parameters} from '@/storybook-utils/common/common-meta-parameters';
import {wrapInSearchInterface} from '@/storybook-utils/search/search-interface-wrapper';

const {decorator, play} = wrapInSearchInterface();
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
  args: {
    ...args,
    'previous-button-icon':
      '<svg viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path d="m11.5 4.8-4.3 4.5c-.3.4-.3.9 0 1.3l4.3 4.6c.3.4.9.4 1.2 0s.3-.9 0-1.3l-3.7-4 3.7-3.9c.3-.4.3-.9 0-1.3-.3-.3-.9-.3-1.2.1z"/></svg>',
    'next-button-icon':
      '<svg viewBox="0 0 20 20"><path d="m8.5 15.2 4.3-4.6c.3-.4.3-.9 0-1.3l-4.4-4.5c-.3-.4-.9-.4-1.2 0s-.3.9 0 1.3l3.7 4-3.7 3.9c-.3.4-.3.9 0 1.3.4.3 1 .3 1.3-.1z"/></svg>',
  },
  argTypes,
  play,
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

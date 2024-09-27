import {
  playExecuteFirstSearch,
  wrapInCommerceInterface,
} from '@coveo/atomic-storybook-utils/commerce/commerce-interface-wrapper';
import {parameters} from '@coveo/atomic-storybook-utils/common/common-meta-parameters';
import {renderComponent} from '@coveo/atomic-storybook-utils/common/render-component';
import type {Meta, StoryObj as Story} from '@storybook/web-components';

const {decorator, play} = wrapInCommerceInterface({skipFirstSearch: true});

const meta: Meta = {
  component: 'atomic-commerce-pager',
  title: 'Atomic-Commerce/Interface Components/atomic-commerce-pager',
  id: 'atomic-commerce-pager',
  render: renderComponent,
  decorators: [decorator],
  parameters,
  play,
};

export default meta;

export const Default: Story = {
  name: 'atomic-commerce-pager',
  play: async (context) => {
    await play(context);
    await playExecuteFirstSearch(context);
  },
};

export const CustomIcon: Story = {
  name: 'With custom icon',
  tags: ['commerce'],
  args: {
    'attributes-previous-button-icon':
      'https://raw.githubusercontent.com/coveo/ui-kit/master/packages/atomic/src/images/arrow-top-rounded.svg',
    'attributes-next-button-icon':
      'https://raw.githubusercontent.com/coveo/ui-kit/master/packages/atomic/src/images/arrow-top-rounded.svg',
  },
  play: async (context) => {
    await play(context);
    await playExecuteFirstSearch(context);
  },
};

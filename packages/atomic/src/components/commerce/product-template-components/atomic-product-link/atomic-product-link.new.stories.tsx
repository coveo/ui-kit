import {
  playExecuteFirstSearch,
  wrapInCommerceProductList,
} from '@coveo/atomic/storybookUtils/commerce-interface-wrapper';
import {parameters} from '@coveo/atomic/storybookUtils/common-meta-parameters';
import {renderResultComponent} from '@coveo/atomic/storybookUtils/render-component';
import type {Meta, StoryObj as Story} from '@storybook/web-components';

const {decorator, play} = wrapInCommerceProductList({skipFirstSearch: true});

const meta: Meta = {
  component: 'atomic-product-link',
  title: 'Atomic-Commerce/ProductLink',
  id: 'atomic-product-link',
  render: renderResultComponent,
  decorators: [decorator],
  parameters,
  play,
};

export default meta;

export const Default: Story = {
  name: 'atomic-product-link',
  play: async (context) => {
    await play(context);
    await playExecuteFirstSearch(context);
  },
};

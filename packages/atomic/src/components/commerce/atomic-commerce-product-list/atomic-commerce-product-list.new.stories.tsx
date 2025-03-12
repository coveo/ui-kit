import {wrapInCommerceInterface} from '@/storybook-utils/commerce/commerce-interface-wrapper';
import {parameters} from '@/storybook-utils/common/common-meta-parameters';
import {renderComponent} from '@/storybook-utils/common/render-component';
import {getSampleCommerceEngineConfiguration} from '@coveo/headless/commerce';
import type {Meta, StoryObj as Story} from '@storybook/web-components';
import './atomic-commerce-product-list';

// Wrap it in whatever interface/component you need
const {context} = getSampleCommerceEngineConfiguration();

const {decorator, play} = wrapInCommerceInterface({
  engineConfig: {
    context: {
      ...context,
      view: {
        url: 'https://sports.barca.group/browse/promotions/clothing/pants',
      },
    },
  },
  skipFirstRequest: false,
  type: 'product-listing',
});
// const {decorator, play} = wrapInCommerceInterface();

const meta: Meta = {
  component: 'atomic-commerce-product-list',
  title: 'AtomicCommerceProductList',
  id: 'atomic-commerce-product-list',
  render: renderComponent,
  decorators: [decorator],
  parameters,
  play,
};

export default meta;

export const Default: Story = {
  name: 'atomic-commerce-product-list',
  args: {
    'attributes-display': 'grid',
    'attributes-density': 'compact',
    'attributes-image-size': 'small',
  },
};

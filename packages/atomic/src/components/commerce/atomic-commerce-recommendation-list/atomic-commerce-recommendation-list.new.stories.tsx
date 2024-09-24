import {wrapInCommerceInterface} from '@coveo/atomic-storybook-utils/commerce/commerce-interface-wrapper';
import {parameters} from '@coveo/atomic-storybook-utils/common/common-meta-parameters';
import {renderComponent} from '@coveo/atomic-storybook-utils/common/render-component';
import type {Meta, StoryObj as Story} from '@storybook/web-components';

const {decorator, play} = wrapInCommerceInterface({skipFirstSearch: false});

const meta: Meta = {
  component: 'atomic-commerce-recommendation-list',
  title: 'Atomic-Commerce/Atomic Recommendation List',
  id: 'atomic-commerce-recommendation-list',
  render: renderComponent,
  decorators: [decorator],
  parameters,
  play,
  args: {'attributes-slot-id': 'd8118c04-ff59-4f03-baca-2fc5f3b81221'},
};

export default meta;

export const Default: Story = {
  name: 'atomic-commerce-recommendation-list',
};

// export const WithProductId: Story = {
//   args: {
//     'attributes-slot-id': 'd8118c04-ff59-4f03-baca-2fc5f3b81221',
//     'attributes-product-id': '1',
//   },
// };

const {play: playNoFirstQuery} = wrapInCommerceInterface({
  skipFirstSearch: true,
});
export const BeforeQuery: Story = {
  tags: ['test'],
  play: playNoFirstQuery,
};

export const WithFullTemplate: Story = {
  tags: ['test'],
  args: {
    'slots-default': ` <atomic-product-template>
                  <template>
 <atomic-product-section-visual>
                <span>Visual Section</span>
              </atomic-product-section-visual>
              <atomic-product-section-badge>
                <span>Badge Section</span>
              </atomic-product-section-badge>
              <atomic-product-section-actions>
                <span>Actions Section</span>
              </atomic-product-section-actions>
              <atomic-product-section-title>
                <span>Title Section</span>
              </atomic-product-section-title>
              <atomic-product-section-title-metadata>
                  <span>Title Metadata Section</span>
              </atomic-product-section-title-metadata>
              <atomic-product-section-emphasized>
                <span>Emphasized Section</span>
              </atomic-product-section-emphasized>
              <atomic-product-section-excerpt>
                <span>Excerpt Section</span>
              </atomic-product-section-excerpt>
              <atomic-product-section-bottom-metadata>
                <span>Bottom Metadata Section</span>
              </atomic-product-section-bottom-metadata>
                  </template>
                </atomic-product-template>`,
  },
};

export const AsCarousel: Story = {};
// display
// density
// image Size

//carousel

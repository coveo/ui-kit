import {wrapInCommerceInterface} from '@/storybook-utils/commerce/commerce-interface-wrapper';
import {parameters} from '@/storybook-utils/common/common-meta-parameters';
import {renderComponent} from '@/storybook-utils/common/render-component';
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
  args: {
    'attributes-slot-id': 'd8118c04-ff59-4f03-baca-2fc5f3b81221',
    'slots-default': `<atomic-product-template>
                  <template>
                    <atomic-product-section-name>
                      <atomic-product-link class="font-bold"></atomic-product-link>
                    </atomic-product-section-name>
                    <atomic-product-section-visual>
                      <atomic-product-image field="ec_thumbnails"></atomic-product-image>
                    </atomic-product-section-visual>
                    <atomic-product-section-metadata>
                      <atomic-product-text field="ec_brand" class="text-neutral-dark block"></atomic-product-text>
                      <atomic-product-rating field="ec_rating"></atomic-product-rating>
                    </atomic-product-section-metadata>
                    <atomic-product-section-emphasized>
                      <atomic-product-price currency="USD"></atomic-product-price>
                    </atomic-product-section-emphasized>
                    <atomic-product-section-children>
                      <atomic-product-children></atomic-product-children>
                    </atomic-product-section-children>
                  </template>
                </atomic-product-template>`,
  },
};
export default meta;

export const Default: Story = {
  name: 'atomic-commerce-recommendation-list',
};

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

export const RecsOpeningInNewTab: Story = {
  tags: ['test'],
  args: {
    'slots-default': ` <atomic-product-template>
                <template slot="link">
                  <atomic-product-link>
                    <a slot="attributes" target="_blank"></a>
                  </atomic-product-link>
                </template>
                <template>
                  <atomic-product-section-title>
                    <atomic-product-text field="ec_name"></atomic-product-text>
                  </atomic-product-section-title>
                </template>
              </atomic-product-template>`,
  },
};

export const AsCarousel: Story = {
  args: {
    'attributes-products-per-page': 3,
  },
};

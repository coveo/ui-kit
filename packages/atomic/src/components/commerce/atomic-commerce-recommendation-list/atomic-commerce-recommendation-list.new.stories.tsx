import {
  playExecuteFirstSearch,
  wrapInCommerceInterface,
} from '@coveo/atomic-storybook-utils/commerce/commerce-interface-wrapper';
import {parameters} from '@coveo/atomic-storybook-utils/common/common-meta-parameters';
import {renderComponent} from '@coveo/atomic-storybook-utils/common/render-component';
import type {Meta, StoryObj as Story} from '@storybook/web-components';
import {html} from 'lit';

const {decorator, play} = wrapInCommerceInterface({skipFirstSearch: true});

const meta: Meta = {
  component: 'atomic-commerce-recommendation-list',
  title: 'Atomic-Commerce/Atomic Recommendation List',
  id: 'atomic-commerce-recommendation-list',
  render: renderComponent,
  decorators: [decorator],
  parameters,
  play,
};

export default meta;

export const Default: Story = {
  name: 'atomic-commerce-recommendation-list',
  play: async (context) => {
    await play(context);
    await playExecuteFirstSearch(context);
  },
};

// What are the differences type of recommendation lists ? what to show here ?
export const InAPage: Story = {
  name: 'In a page',
  decorators: [
    (story) => html`
      <atomic-commerce-layout>
        <atomic-layout-section section="facets">
          <atomic-commerce-facets></atomic-commerce-facets>
        </atomic-layout-section>
        <atomic-layout-section section="main">
          ${story()}
          <atomic-commerce-recommendation-list
            id="cart_recommendations"
            slot-id="d8118c04-ff59-4f03-baca-2fc5f3b81221"
            products-per-page="3"
          >
            <atomic-product-template>
              <template>
                <atomic-product-section-name>
                  <atomic-product-link class="font-bold"></atomic-product-link>
                </atomic-product-section-name>
                <atomic-product-section-visual>
                  <atomic-product-image
                    field="ec_thumbnails"
                  ></atomic-product-image>
                </atomic-product-section-visual>
                <atomic-product-section-metadata>
                  <atomic-product-text
                    field="ec_brand"
                    class="text-neutral-dark block"
                  ></atomic-product-text>
                  <atomic-product-rating
                    field="ec_rating"
                  ></atomic-product-rating>
                </atomic-product-section-metadata>
                <atomic-product-section-emphasized>
                  <atomic-product-price currency="USD"></atomic-product-price>
                </atomic-product-section-emphasized>
                <atomic-product-section-children>
                  <atomic-product-children></atomic-product-children>
                </atomic-product-section-children>
              </template>
            </atomic-product-template>
          </atomic-commerce-recommendation-list>
        </atomic-layout-section>
      </atomic-commerce-layout>
    `,
  ],
};

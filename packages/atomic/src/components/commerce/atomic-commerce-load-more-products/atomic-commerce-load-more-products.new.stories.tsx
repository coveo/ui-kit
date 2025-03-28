import {wrapInCommerceInterface} from '@/storybook-utils/commerce/commerce-interface-wrapper';
import {parameters} from '@/storybook-utils/common/common-meta-parameters';
import {
  renderComponent,
  renderComponentWithoutCodeRoot,
} from '@/storybook-utils/common/render-component';
import type {Meta, StoryObj as Story} from '@storybook/web-components';
import {html} from 'lit';

const {decorator, play} = wrapInCommerceInterface({skipFirstRequest: false});

const meta: Meta = {
  component: 'atomic-commerce-load-more-products',
  title: 'Commerce/atomic-commerce-load-more-products',
  id: 'atomic-commerce-load-more-products',
  render: renderComponent,
  decorators: [decorator],
  parameters,
  play,
};

export default meta;

export const Default: Story = {};

export const InPage: Story = {
  name: 'In a page',
  render: renderComponentWithoutCodeRoot,
  decorators: [
    (story) =>
      html` <atomic-commerce-layout>
        <atomic-layout-section section="search">
          <atomic-commerce-search-box></atomic-commerce-search-box>
        </atomic-layout-section>
        <atomic-layout-section section="facets"
          ><atomic-commerce-facets></atomic-commerce-facets
        ></atomic-layout-section>
        <atomic-layout-section section="main">
          <atomic-layout-section section="status">
            <atomic-commerce-query-summary></atomic-commerce-query-summary>
            <atomic-commerce-sort-dropdown></atomic-commerce-sort-dropdown>
          </atomic-layout-section>
          <atomic-layout-section section="products">
            <atomic-commerce-product-list
              display="grid"
              density="compact"
              image-size="small"
            >
            </atomic-commerce-product-list>
            <atomic-commerce-query-error></atomic-commerce-query-error>
          </atomic-layout-section>
          <atomic-layout-section section="pagination" id="code-root">
            ${story()}
          </atomic-layout-section>
        </atomic-layout-section>
      </atomic-commerce-layout>`,
  ],
};

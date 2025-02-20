import {
  playExecuteFirstSearch,
  wrapInCommerceInterface,
} from '@/storybook-utils/commerce/commerce-interface-wrapper';
import {parameters} from '@/storybook-utils/common/common-meta-parameters';
import {renderComponent} from '@/storybook-utils/common/render-component';
import type {Meta, StoryObj as Story} from '@storybook/web-components';
import {html} from 'lit';

const {decorator, play} = wrapInCommerceInterface({skipFirstSearch: true});

const meta: Meta = {
  component: 'atomic-commerce-search-box',
  title: 'Atomic-Commerce/Interface Components/atomic-commerce-search-box',
  id: 'atomic-commerce-search-box',
  render: renderComponent,
  decorators: [decorator],
  parameters,
  play,
};

export default meta;

export const Default: Story = {
  name: 'atomic-commerce-search-box',
};

export const RichSearchBox: Story = {
  name: 'With suggestions and recent queries',
  args: {
    'slots-default': ` <atomic-commerce-search-box-recent-queries></atomic-commerce-search-box-recent-queries>
      <atomic-commerce-search-box-query-suggestions></atomic-commerce-search-box-query-suggestions>
      <atomic-commerce-search-box-instant-products
        image-size="small"
      ></atomic-commerce-search-box-instant-products>`,
  },
};

export const StandaloneSearchBox: Story = {
  name: 'Standalone search box',
  args: {
    'attributes-redirection-url':
      './iframe.html?id=atomic-commerce-search-box--in-page&viewMode=story&args=enable-query-syntax:!true;suggestion-timeout:5000',
  },
};

export const InPage: Story = {
  name: 'In a page',
  decorators: [
    (story) =>
      html` <atomic-commerce-layout>
        <atomic-layout-section section="search">
          ${story()}
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
          <atomic-layout-section section="pagination">
            <atomic-commerce-load-more-products></atomic-commerce-load-more-products>
            <!-- Alternative pagination
      <atomic-commerce-pager></atomic-commerce-pager>
      -->
          </atomic-layout-section>
        </atomic-layout-section>
      </atomic-commerce-layout>`,
  ],
  play: async (context) => {
    await play(context);
    await playExecuteFirstSearch(context);
  },
};

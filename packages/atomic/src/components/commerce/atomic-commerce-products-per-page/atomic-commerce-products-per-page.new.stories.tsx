import {wrapInCommerceInterface} from '@/storybook-utils/commerce/commerce-interface-wrapper';
import {parameters} from '@/storybook-utils/common/common-meta-parameters';
import {renderComponent} from '@/storybook-utils/common/render-component';
import type {Meta, StoryObj as Story} from '@storybook/web-components';
import {html} from 'lit';

const {decorator, play} = wrapInCommerceInterface({});

const meta: Meta = {
  component: 'atomic-commerce-products-per-page',
  title: 'Atomic-Commerce/ProductsPerPage',
  id: 'atomic-commerce-products-per-page',

  render: renderComponent,
  decorators: [decorator],
  parameters,
  play: async (context) => {
    await play(context);
  },
};

export default meta;

export const Default: Story = {
  name: 'atomic-commerce-products-per-page',
};

export const InAPage: Story = {
  name: 'In a page',
  decorators: [(story) => createCommerceLayout(story)],
};

export const InAPageWithCustomChoicesDisplayed: Story = {
  name: 'In a page with custom choices displayed',
  args: {
    'attributes-choices-displayed': '2,3,4,5,6',
  },
  tags: ['test'],
  decorators: [(story) => createCommerceLayout(story)],
};

const createCommerceLayout = (story) => html`
  <atomic-commerce-layout>
    <atomic-layout-section section="facets">
      <atomic-commerce-facets></atomic-commerce-facets>
    </atomic-layout-section>
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
        ${story()}
      </atomic-layout-section>
    </atomic-layout-section>
  </atomic-commerce-layout>
`;

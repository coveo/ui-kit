import {parameters} from '@/storybook-utils/common/common-meta-parameters';
import {renderComponent} from '@/storybook-utils/common/render-component';
import {getSampleCommerceEngineConfiguration} from '@coveo/headless/commerce';
import type {Meta, StoryObj as Story} from '@storybook/web-components';

async function initializeCommerceInterface(canvasElement: HTMLElement) {
  await customElements.whenDefined('atomic-commerce-interface');
  const commerceInterface = canvasElement.querySelector(
    'atomic-commerce-interface'
  );
  await commerceInterface!.initialize(getSampleCommerceEngineConfiguration());
}
const meta: Meta = {
  component: 'atomic-commerce-interface',
  title: 'Atomic-Commerce/Interfaces/atomic-commerce-interface',
  id: 'atomic-commerce-interface',
  render: renderComponent,
  parameters,
  play: async (context) => {
    await initializeCommerceInterface(context.canvasElement);
    const searchInterface = context.canvasElement.querySelector(
      'atomic-commerce-interface'
    );
    await searchInterface!.executeFirstRequest();
  },
  argTypes: {
    'attributes-language': {
      name: 'language',
      type: 'string',
    },
  },
};

export default meta;

export const Default: Story = {
  name: 'atomic-commerce-interface',
};

export const SearchBeforeInit: Story = {
  tags: ['commerce', 'test'],
  play: async (context) => {
    const commerceInterface = context.canvasElement.querySelector(
      'atomic-commerce-interface'
    );
    await commerceInterface!.executeFirstRequest();
  },
};

export const WithProductList: Story = {
  tags: ['commerce', 'test'],
  args: {
    'slots-default': `
      <atomic-commerce-layout>
        <atomic-layout-section section="search">
          <atomic-commerce-search-box></atomic-commerce-search-box>
        </atomic-layout-section>
        <atomic-layout-section section="facets">
          <atomic-commerce-facets></atomic-commerce-facets>
        </atomic-layout-section>
        <atomic-layout-section section="main">
          <atomic-layout-section section="status">
            <atomic-commerce-breadbox></atomic-commerce-breadbox>
            <atomic-commerce-query-summary></atomic-commerce-query-summary>
            <atomic-commerce-sort-dropdown></atomic-commerce-sort-dropdown>
          </atomic-layout-section>
          <atomic-layout-section section="products">
            <atomic-commerce-product-list
              display="grid"
              density="compact"
              image-size="small"
            ></atomic-commerce-product-list>
            <atomic-commerce-query-error></atomic-commerce-query-error>
          </atomic-layout-section>
          <atomic-layout-section section="pagination">
            <atomic-commerce-pager></atomic-commerce-pager>
            <atomic-commerce-products-per-page>
            </atomic-commerce-products-per-page>
          </atomic-layout-section>
        </atomic-layout-section>
      </atomic-commerce-layout>
    `,
  },
};

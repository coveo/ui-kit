import {parameters} from '@coveo/atomic-storybook-utils/common/common-meta-parameters';
import {renderComponent} from '@coveo/atomic-storybook-utils/common/render-component';
import {getSampleCommerceEngineConfiguration} from '@coveo/headless/commerce';
import type {Meta, StoryObj as Story} from '@storybook/web-components';

async function initializeSearchInterface(canvasElement: HTMLElement) {
  await customElements.whenDefined('atomic-commerce-interface');
  const searchInterface = canvasElement.querySelector(
    'atomic-commerce-interface'
  );
  await searchInterface!.initialize({
    ...getSampleCommerceEngineConfiguration(),
    ...{},
  });
}
const meta: Meta = {
  component: 'atomic-commerce-interface',
  title: 'Atomic-Commerce/Interfaces/atomic-commerce-interface',
  id: 'atomic-commerce-interface',
  render: renderComponent,
  parameters,
  play: async (context) => {
    await initializeSearchInterface(context.canvasElement);
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
    const searchInterface = context.canvasElement.querySelector(
      'atomic-commerce-interface'
    );
    await searchInterface!.executeFirstRequest();
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
          <atomic-layout-section section="pagination"></atomic-layout-section>
        </atomic-layout-section>
      </atomic-commerce-layout>
    `,
  },
};

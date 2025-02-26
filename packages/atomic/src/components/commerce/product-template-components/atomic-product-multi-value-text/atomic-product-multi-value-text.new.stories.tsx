import {wrapInCommerceInterface} from '@/storybook-utils/commerce/commerce-interface-wrapper';
import {wrapInCommerceProductList} from '@/storybook-utils/commerce/commerce-product-list-wrapper';
import {wrapInProductTemplate} from '@/storybook-utils/commerce/commerce-product-template-wrapper';
import {parameters} from '@/storybook-utils/common/common-meta-parameters';
import {renderComponent} from '@/storybook-utils/common/render-component';
import {getSampleCommerceEngineConfiguration} from '@coveo/headless/commerce';
import type {Meta, StoryObj as Story} from '@storybook/web-components';
import {html} from 'lit';

const baseConfiguration = getSampleCommerceEngineConfiguration();

const {decorator: productDecorator} = wrapInProductTemplate();
const {decorator: commerceProductListDecorator} = wrapInCommerceProductList();
const {decorator: commerceInterfaceDecorator, play} = wrapInCommerceInterface({
  engineConfig: {
    ...baseConfiguration,
    context: {
      ...baseConfiguration.context,
      view: {
        url: 'https://sports.barca.group/browse/promotions/ui-kit-testing-product-multi-value-text',
      },
    },
  },
  type: 'product-listing',
});

const meta: Meta = {
  component: 'atomic-product-multi-value-text',
  title: 'Atomic-Commerce/Product Template Components/MultiValueText',
  id: 'atomic-product-multi-value-text',
  render: renderComponent,
  parameters,
  play,
  args: {
    'attributes-field': 'cat_available_sizes',
  },
};

export default meta;

export const Default: Story = {
  name: 'atomic-product-multi-value-text',
  decorators: [
    productDecorator,
    commerceProductListDecorator,
    commerceInterfaceDecorator,
  ],
};

export const WithDelimiter: Story = {
  name: 'With delimiter',
  decorators: [
    productDecorator,
    commerceProductListDecorator,
    commerceInterfaceDecorator,
  ],
  args: {
    'attributes-field': 'ec_product_id',
    'attributes-delimiter': '_',
  },
};

export const WithMaxValuesToDisplaySetToMinimum: Story = {
  name: 'With max values to display set to minimum',
  decorators: [
    productDecorator,
    commerceProductListDecorator,
    commerceInterfaceDecorator,
  ],
  args: {
    'attributes-max-values-to-display': 1,
  },
};

export const WithMaxValuesToDisplaySetToTotalNumberOfValues: Story = {
  name: 'With max values to display set to total number of values',
  decorators: [
    productDecorator,
    commerceProductListDecorator,
    commerceInterfaceDecorator,
  ],
  args: {
    'attributes-max-values-to-display': 6,
  },
};

export const InAPageWithTheCorrespondingFacet: Story = {
  name: 'In a page with the corresponding facet',
  decorators: [
    productDecorator,
    commerceProductListDecorator,
    (story) => {
      return html`
        <atomic-commerce-layout>
          <atomic-layout-section section="facets"
            ><atomic-commerce-facets></atomic-commerce-facets>
          </atomic-layout-section>
          <atomic-layout-section section="main">
            ${story()}
          </atomic-layout-section>
        </atomic-commerce-layout>
      `;
    },
    commerceInterfaceDecorator,
  ],
};

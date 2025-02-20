import {wrapInCommerceInterface} from '@/storybook-utils/commerce/commerce-interface-wrapper';
import {wrapInCommerceProductList} from '@/storybook-utils/commerce/commerce-product-list-wrapper';
import {wrapInProductTemplate} from '@/storybook-utils/commerce/commerce-product-template-wrapper';
import {parameters} from '@/storybook-utils/common/common-meta-parameters';
import {renderComponent} from '@/storybook-utils/common/render-component';
import type {Meta, StoryObj as Story} from '@storybook/web-components';
import type {Decorator} from '@storybook/web-components';
import {html} from 'lit';

const styledDivDecorator: Decorator = (story) => {
  return html`<div style="max-width: 700px">${story()}</div>`;
};

const {
  decorator: commerceInterfaceDecorator,
  play: initializeCommerceInterface,
} = wrapInCommerceInterface({
  skipFirstSearch: false,
  type: 'product-listing',
  engineConfig: {
    context: {
      view: {
        url: 'https://ui-kit.coveo/atomic/storybook/atomic-product-image',
      },
      language: 'en',
      country: 'US',
      currency: 'USD',
    },
  },
});
const {decorator: commerceProductListDecorator} = wrapInCommerceProductList();
const {decorator: productTemplateDecorator} = wrapInProductTemplate();

const meta: Meta = {
  component: 'atomic-product-image',
  title: 'Atomic-Commerce/Product Template Components/ProductImage',
  id: 'atomic-product-image',
  render: renderComponent,
  decorators: [
    productTemplateDecorator,
    commerceProductListDecorator,
    commerceInterfaceDecorator,
    styledDivDecorator,
  ],
  parameters,
  play: initializeCommerceInterface,
};

export default meta;

export const Default: Story = {
  name: 'atomic-product-image',
};

export const withAFallbackImage: Story = {
  name: 'With a fallback image',
  args: {
    'attributes-field': 'invalid',
    'attributes-fallback': 'https://sports.barca.group/logos/barca.svg',
  },
};

export const withAnAltTextField: Story = {
  name: 'With an alt text field',
  args: {
    'attributes-field': 'invalid',
    'attributes-fallback': 'invalid',
    'attributes-image-alt-field': 'ec_name',
  },
};

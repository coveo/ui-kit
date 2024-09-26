import {wrapInCommerceInterface} from '@coveo/atomic-storybook-utils/commerce/commerce-interface-wrapper';
import {wrapInCommerceProductList} from '@coveo/atomic-storybook-utils/commerce/commerce-product-list-wrapper';
import {wrapInProductTemplate} from '@coveo/atomic-storybook-utils/commerce/commerce-product-template-wrapper';
import {parameters} from '@coveo/atomic-storybook-utils/common/common-meta-parameters';
import {renderComponent} from '@coveo/atomic-storybook-utils/common/render-component';
import type {Meta} from '@storybook/web-components';

const {
  decorator: commerceInterfaceDecorator,
  play: initializeCommerceInterface,
} = wrapInCommerceInterface({
  skipFirstSearch: false,
  type: 'product-listing',
  engineConfig: {
    context: {
      view: {
        url: 'https://sports.barca.group/browse/promotions/ui-kit-testing',
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
  ],
  parameters,
  play: initializeCommerceInterface,
};

export default meta;

// export const Default: Story = {
//   name: 'atomic-product-image',
//   args: {
//     'attributes-fallback': '2',
//     play: async (context) => {
//       await play(context);
//       await playExecuteFirstSearch(context);
//     },
//   },
// };

// const {play: playWithMultipleImages} = wrapInCommerceInterface({
//   engineConfig: {
//     ...engineConfig,
//     preprocessRequest: (r) => {
//       const parsed = JSON.parse(r.body as string);
//       parsed.query = 'https://sports.barca.group/pdp/SP00003_00001';
//       r.body = JSON.stringify(parsed);
//       return r;
//     },
//   },
// });

// export const WithMultipleImages: Story = {
//   name: 'With multiple images',
//   play: async (context) => {
//     await playWithMultipleImages(context);
//   },
// };

// export const WithNoImage: Story = {
//   name: 'With no image',
//   args: {
//     'attributes-field': 'ec_invalid_image_field',
//   },
//   play: async (context) => {
//     await play(context);
//     await playExecuteFirstSearch(context);
//   },
// };

// export const WitCustomFallbackImage: Story = {
//   name: 'With custom fallback',
//   args: {
//     'attributes-field': 'ec_invalid_image_field',
//     'attributes-fallback': 'https://sports.barca.group/logos/barca.svg',
//   },
//   play: async (context) => {
//     await play(context);
//     await playExecuteFirstSearch(context);
//   },
// };

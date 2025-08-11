import type {Meta, StoryObj as Story} from '@storybook/web-components';
import {wrapInCommerceInterface} from '@/storybook-utils/commerce/commerce-interface-wrapper';
import {wrapInCommerceProductList} from '@/storybook-utils/commerce/commerce-product-list-wrapper';
import {wrapInProductTemplate} from '@/storybook-utils/commerce/commerce-product-template-wrapper';
import {parameters} from '@/storybook-utils/common/common-meta-parameters';
import {renderComponent} from '@/storybook-utils/common/render-component';

const {
  decorator: commerceInterfaceDecorator,
  play: initializeCommerceInterface,
} = wrapInCommerceInterface({
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
    preprocessRequest: (request) => {
      const parsed = JSON.parse(request.body as string);
      parsed.perPage = 1;
      request.body = JSON.stringify(parsed);
      return request;
    },
  },
});
const {decorator: commerceProductListDecorator} = wrapInCommerceProductList();
const {decorator: productTemplateDecorator} = wrapInProductTemplate();

const meta: Meta = {
  component: 'atomic-product-rating',
  title: 'Commerce/Product Rating',
  id: 'atomic-product-rating',
  render: renderComponent,
  decorators: [
    productTemplateDecorator,
    commerceProductListDecorator,
    commerceInterfaceDecorator,
  ],
  parameters,
  play: initializeCommerceInterface,
  argTypes: {
    'attributes-field': {
      name: 'field',
      type: 'string',
      description: 'The field to use for the rating value',
    },
    'attributes-rating-details-field': {
      name: 'rating-details-field',
      type: 'string',
      description:
        'The field to use for rating details (e.g., number of reviews)',
    },
    'attributes-max-value-in-index': {
      name: 'max-value-in-index',
      type: 'number',
      description: 'The maximum rating value in the index',
    },
    'attributes-icon': {
      name: 'icon',
      type: 'string',
      description: 'The URL of the icon to use for rating display',
    },
  },
};

export default meta;

export const Default: Story = {};

export const WithARatingDetailsField: Story = {
  name: 'With a rating details field',
  args: {
    'attributes-rating-details-field': 'ec_rating',
  },
};

export const WithAMaxValueInIndex: Story = {
  name: 'With a custom max value',
  args: {
    'attributes-max-value-in-index': 10,
  },
};

export const WithADifferentIcon: Story = {
  name: 'With a custom icon',
  args: {
    'attributes-icon':
      'https://raw.githubusercontent.com/Rush/Font-Awesome-SVG-PNG/master/black/svg/circle.svg',
  },
};

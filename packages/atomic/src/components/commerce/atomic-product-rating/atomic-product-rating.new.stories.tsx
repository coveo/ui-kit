import type {Meta, StoryObj as Story} from '@storybook/web-components-vite';
import {getStorybookHelpers} from '@wc-toolkit/storybook-helpers';
import {wrapInCommerceInterface} from '@/storybook-utils/commerce/commerce-interface-wrapper';
import {wrapInCommerceProductList} from '@/storybook-utils/commerce/commerce-product-list-wrapper';
import {wrapInProductTemplate} from '@/storybook-utils/commerce/commerce-product-template-wrapper';
import {parameters} from '@/storybook-utils/common/common-meta-parameters';

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
  includeCodeRoot: false,
});
const {decorator: commerceProductListDecorator} = wrapInCommerceProductList(
  'list',
  false
);
const {decorator: productTemplateDecorator} = wrapInProductTemplate();
const {events, args, argTypes, template} = getStorybookHelpers(
  'atomic-product-rating',
  {
    excludeCategories: ['methods'],
    containerSelector: 'atomic-product-template template',
  }
);

const meta: Meta = {
  component: 'atomic-product-rating',
  title: 'Commerce/Product Rating',
  id: 'atomic-product-rating',
  render: (args) => template(args),
  decorators: [
    productTemplateDecorator,
    commerceProductListDecorator,
    commerceInterfaceDecorator,
  ],
  parameters: {
    ...parameters,
    actions: {
      handles: events,
    },
  },
  args,
  argTypes,

  play: initializeCommerceInterface,
};

export default meta;

export const Default: Story = {};

export const WithARatingDetailsField: Story = {
  name: 'With a rating details field',
  args: {
    'rating-details-field': 'ec_rating',
  },
};

export const WithAMaxValueInIndex: Story = {
  name: 'With a custom max value',
  args: {
    'max-value-in-index': 10,
  },
};

export const WithADifferentIcon: Story = {
  name: 'With a custom icon',
  args: {
    icon: 'https://raw.githubusercontent.com/Rush/Font-Awesome-SVG-PNG/master/black/svg/circle.svg',
  },
};

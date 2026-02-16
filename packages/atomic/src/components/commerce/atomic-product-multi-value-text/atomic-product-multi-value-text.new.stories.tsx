import type {Meta, StoryObj as Story} from '@storybook/web-components-vite';
import {getStorybookHelpers} from '@wc-toolkit/storybook-helpers';
import {wrapInCommerceInterface} from '@/storybook-utils/commerce/commerce-interface-wrapper';
import {wrapInCommerceProductList} from '@/storybook-utils/commerce/commerce-product-list-wrapper';
import {wrapInProductTemplate} from '@/storybook-utils/commerce/commerce-product-template-wrapper';
import {parameters} from '@/storybook-utils/common/common-meta-parameters';

const {decorator: productDecorator} = wrapInProductTemplate();
const {decorator: commerceProductListDecorator} = wrapInCommerceProductList(
  'list',
  false
);
const {events, args, argTypes, template} = getStorybookHelpers(
  'atomic-product-multi-value-text',
  {excludeCategories: ['methods']}
);
const {decorator: commerceInterfaceDecorator, play} = wrapInCommerceInterface({
  engineConfig: {
    preprocessRequest: (request) => {
      const parsed = JSON.parse(request.body as string);
      parsed.perPage = 1;
      request.body = JSON.stringify(parsed);
      return request;
    },
  },
  includeCodeRoot: false,
});

const meta: Meta = {
  component: 'atomic-product-multi-value-text',
  title: 'Commerce/Product Multi-Value Text',
  id: 'atomic-product-multi-value-text',
  render: (args) => template(args),
  parameters: {
    ...parameters,
    actions: {
      handles: events,
    },
  },
  argTypes,

  decorators: [
    productDecorator,
    commerceProductListDecorator,
    commerceInterfaceDecorator,
  ],
  play,
  args: {
    ...args,
    field: 'cat_available_sizes',
  },
};

export default meta;

export const Default: Story = {};

export const WithMaxValuesToDisplaySetToMinimum: Story = {
  name: 'With max-values-set-to-display set to minimum',
  args: {
    'max-values-to-display': 1,
  },
};

export const WithMaxValuesToDisplaySetToTotalNumberOfValues: Story = {
  name: 'With max-values-set-to-display set to total number of values',
  args: {
    'max-values-to-display': 6,
  },
};

import type {Meta, StoryObj as Story} from '@storybook/web-components-vite';
import {getStorybookHelpers} from '@wc-toolkit/storybook-helpers';
import {wrapInCommerceInterface} from '@/storybook-utils/commerce/commerce-interface-wrapper';
import {wrapInCommerceProductList} from '@/storybook-utils/commerce/commerce-product-list-wrapper';
import {wrapInProductTemplate} from '@/storybook-utils/commerce/commerce-product-template-wrapper';
import {parameters} from '@/storybook-utils/common/common-meta-parameters';

const {decorator: commerceInterfaceDecorator, afterEach} =
  wrapInCommerceInterface({
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
const {decorator: commerceProductListDecorator} = wrapInCommerceProductList(
  'list',
  false
);
const {decorator: productTemplateDecorator} = wrapInProductTemplate();
const {events, args, argTypes, template} = getStorybookHelpers(
  'atomic-product-field-condition',
  {excludeCategories: ['methods']}
);

const meta: Meta = {
  component: 'atomic-product-field-condition',
  title: 'Commerce/Product Field Condition',
  id: 'atomic-product-field-condition',
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
  argTypes,

  afterEach,
  args: {
    ...args,
    'default-slot': `<span>Render me if <strong>ec_name</strong> is defined.</span>`,
    ifDefined: 'ec_name',
  },
};

export default meta;

export const Default: Story = {};

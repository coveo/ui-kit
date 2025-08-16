import type {Meta, StoryObj as Story} from '@storybook/web-components-vite';
import {getStorybookHelpers} from '@wc-toolkit/storybook-helpers';
import {wrapInCommerceInterface} from '@/storybook-utils/commerce/commerce-interface-wrapper';
import {wrapInCommerceProductList} from '@/storybook-utils/commerce/commerce-product-list-wrapper';
import {wrapInProductTemplateForSections} from '@/storybook-utils/commerce/product-template-section-wrapper';
import {parameters} from '@/storybook-utils/common/common-meta-parameters';

const {events, args, argTypes, template} = getStorybookHelpers(
  'atomic-product-section-visual',
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
const {decorator: commerceProductListDecorator} = wrapInCommerceProductList(
  'grid',
  false
);
const {decorator: productTemplateDecorator} =
  wrapInProductTemplateForSections();
const meta: Meta = {
  component: 'atomic-product-section-visual',
  title: 'Commerce/Product Sections',
  id: 'atomic-product-section-visual',
  render: (args) => template(args),
  parameters: {
    ...parameters,
    actions: {
      handles: events,
    },
  },
  args,
  argTypes,
};

export default meta;

export const Default: Story = {
  name: 'atomic-product-section-visual',
  decorators: [
    productTemplateDecorator,
    commerceProductListDecorator,
    commerceInterfaceDecorator,
  ],
  afterEach: play,
  args: {
    'default-slot': `<img src="https://images.barca.group/Sports/mj/Clothing/Pants/67_Men_Gray_Elastane/cb1a7d3c9ac3_bottom_left.webp" alt="Product Image" class="w-full h-auto rounded-lg">`,
  },
};

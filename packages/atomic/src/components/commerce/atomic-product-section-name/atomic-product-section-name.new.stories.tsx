import type {Meta, StoryObj as Story} from '@storybook/web-components-vite';
import {getStorybookHelpers} from '@wc-toolkit/storybook-helpers';
import {wrapInCommerceInterface} from '@/storybook-utils/commerce/commerce-interface-wrapper';
import {
  getProductSectionArgs,
  getProductSectionArgTypes,
  getProductSectionDecorators,
} from '@/storybook-utils/commerce/product-section-story-utils';
import {parameters} from '@/storybook-utils/common/common-meta-parameters';

const {events, args, argTypes, template} = getStorybookHelpers(
  'atomic-product-section-name',
  {excludeCategories: ['methods']}
);

const {play} = wrapInCommerceInterface({
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
  component: 'atomic-product-section-name',
  title: 'Commerce/Product Sections',
  id: 'atomic-product-section-name',
  render: (args) => template(args),
  parameters: {
    ...parameters,
    actions: {
      handles: events,
    },
  },
  args: {
    ...args,
    ...getProductSectionArgs(),
  },
  argTypes: {
    ...argTypes,
    ...getProductSectionArgTypes(),
  },
};

export default meta;

export const Default: Story = {
  name: 'atomic-product-section-name',
  decorators: getProductSectionDecorators(),
  play,
  args: {
    'default-slot': `<h3 class="text-lg font-semibold text-gray-900">Sony WH-1000XM4 Wireless Headphones</h3>`,
  },
};

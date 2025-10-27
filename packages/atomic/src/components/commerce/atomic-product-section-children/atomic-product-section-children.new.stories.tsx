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
  'atomic-product-section-children',
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
  component: 'atomic-product-section-children',
  title: 'Commerce/Product Sections',
  id: 'atomic-product-section-children',
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
  name: 'atomic-product-section-children',
  decorators: getProductSectionDecorators(),
  play,
  args: {
    'default-slot': `
      <div class="border border-gray-200 rounded-lg p-3 bg-gray-50 mt-2 ml-4">
        <div class="text-sm font-medium text-gray-700 mb-2">Related Products:</div>
        <div class="space-y-1">
          <div class="text-sm text-gray-600">• Wireless Charging Case - $79.99</div>
          <div class="text-sm text-gray-600">• Premium Foam Tips - $29.99</div>
        </div>
      </div>
    `,
  },
};

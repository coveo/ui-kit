import type {Meta, StoryObj as Story} from '@storybook/web-components-vite';
import {getStorybookHelpers} from '@wc-toolkit/storybook-helpers';
import {MockCommerceApi} from '@/storybook-utils/api/commerce/mock';
import {wrapInCommerceInterface} from '@/storybook-utils/commerce/commerce-interface-wrapper';
import {
  getProductSectionArgs,
  getProductSectionArgTypes,
  getProductSectionDecorators,
} from '@/storybook-utils/commerce/product-section-story-utils';
import {parameters} from '@/storybook-utils/common/common-meta-parameters';
import '@/src/components/commerce/atomic-product-section-metadata/atomic-product-section-metadata.js';

const commerceApiHarness = new MockCommerceApi();

const {events, args, argTypes, template} = getStorybookHelpers(
  'atomic-product-section-metadata',
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
  component: 'atomic-product-section-metadata',
  title: 'Commerce/Product Sections',
  id: 'atomic-product-section-metadata',
  render: (args) => template(args),
  parameters: {
    ...parameters,
    msw: {handlers: [...commerceApiHarness.handlers]},
    chromatic: {disableSnapshot: true},
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
  beforeEach: () => {
    commerceApiHarness.clearAll();
  },
};

export default meta;

export const Default: Story = {
  name: 'atomic-product-section-metadata',
  decorators: getProductSectionDecorators(),
  play,
  args: {
    'default-slot': `<span class="text-sm text-gray-500">SKU: WH-1000XM4</span>`,
  },
};

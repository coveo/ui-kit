import type {Meta, StoryObj as Story} from '@storybook/web-components-vite';
import {getStorybookHelpers} from '@wc-toolkit/storybook-helpers';
import {wrapInCommerceInterface} from '@/storybook-utils/commerce/commerce-interface-wrapper';
import {
  getProductSectionArgs,
  getProductSectionArgTypes,
  getProductSectionDecorators,
} from '@/storybook-utils/commerce/product-section-story-utils';
import {parameters} from '@/storybook-utils/common/common-meta-parameters';

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

const {events, args, argTypes, template} = getStorybookHelpers(
  'atomic-product-section-description',
  {excludeCategories: ['methods']}
);

const meta: Meta = {
  component: 'atomic-product-section-description',
  title: 'Commerce/Product Sections',
  id: 'atomic-product-section-description',
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
  name: 'atomic-product-section-description',
  decorators: getProductSectionDecorators(),
  play,
  args: {
    'default-slot': `<p class="text-sm text-gray-600">Premium wireless headphones with industry-leading noise cancellation and superior sound quality.</p>`,
  },
};

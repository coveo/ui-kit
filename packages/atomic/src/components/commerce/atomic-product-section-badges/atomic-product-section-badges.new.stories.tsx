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
  'atomic-product-section-badges',
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
  component: 'atomic-product-section-badges',
  title: 'Commerce/Product Sections',
  id: 'atomic-product-section-badges',
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
  name: 'atomic-product-section-badges',
  decorators: getProductSectionDecorators(),
  play,
  args: {
    'default-slot': `
      <div>
        <span class="badge badge-primary" style="background: #0F0F0F; color: white; padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: bold;">NEW</span>
        <span class="badge badge-secondary" style="background: #0F0F0F; color: white; padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: bold;">SALE</span>
        <span class="badge badge-success" style="background: #0F0F0F; color: white; padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: bold;">BESTSELLER</span>
      </div>
    `,
  },
};

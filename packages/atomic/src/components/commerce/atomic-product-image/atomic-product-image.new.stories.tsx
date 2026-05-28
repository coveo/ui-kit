import type {Meta, StoryObj as Story} from '@storybook/web-components-vite';
import {getStorybookHelpers} from '@wc-toolkit/storybook-helpers';
import {html} from 'lit';
import {testCarouselA11y} from '@/storybook-utils/a11y/carousel.js';
import {MockCommerceApi} from '@/storybook-utils/api/commerce/mock';
import {wrapInCommerceInterface} from '@/storybook-utils/commerce/commerce-interface-wrapper';
import {wrapInCommerceProductList} from '@/storybook-utils/commerce/commerce-product-list-wrapper';
import {wrapInProductTemplate} from '@/storybook-utils/commerce/commerce-product-template-wrapper';
import {parameters} from '@/storybook-utils/common/common-meta-parameters';
import '@/src/components/commerce/atomic-product-image/atomic-product-image.js';
import '@/src/components/commerce/atomic-product-section-visual/atomic-product-section-visual.js';

const commerceApiHarness = new MockCommerceApi();

// Order: non-carousel product first (1 image), carousel product second (2+ images)
// This matches the e2e test page object: noCarouselImage=nth(0), carouselImage=nth(1)
commerceApiHarness.productListingEndpoint.mock((response) => ({
  ...response,
  products: [response.products[1], response.products[0]],
  pagination: {
    ...response.pagination,
    totalCount: 2,
    perPage: 2,
    totalPages: 1,
  },
}));

const {decorator: commerceInterfaceDecorator, play} = wrapInCommerceInterface({
  type: 'product-listing',
  engineConfig: {
    context: {
      view: {
        url: 'https://ui-kit.coveo/atomic/storybook/atomic-product-image',
      },
      language: 'en',
      country: 'US',
      currency: 'USD',
    },
    preprocessRequest: (request) => {
      const parsed = JSON.parse(request.body as string);
      parsed.perPage = 2;
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
const {decorator: productTemplateDecorator} = wrapInProductTemplate(false);
const {events, args, argTypes, template} = getStorybookHelpers(
  'atomic-product-image',
  {excludeCategories: ['methods']}
);

const meta: Meta = {
  component: 'atomic-product-image',
  title: 'Commerce/Product Image',
  id: 'atomic-product-image',
  render: (args) => template(args),
  decorators: [
    (story) => html`
      <atomic-product-section-visual id="code-root">
        ${story()}
      </atomic-product-section-visual>
    `,
    productTemplateDecorator,
    commerceProductListDecorator,
    commerceInterfaceDecorator,
  ],
  parameters: {
    ...parameters,
    msw: {handlers: [...commerceApiHarness.handlers]},
    chromatic: {disableSnapshot: true},
    actions: {
      handles: events,
    },
  },
  args,
  argTypes,

  play,
  beforeEach: () => {
    commerceApiHarness.clearAll();
  },
};

export default meta;

export const Default: Story = {};

export const A11yCarousel: Story = {
  tags: ['a11y', 'test'],
  play: async (context) => {
    await play(context);
    await testCarouselA11y(context);
  },
};

export const withAFallbackImage: Story = {
  name: 'With a fallback image',
  args: {
    field: 'invalid',
    fallback: 'https://sports.barca.group/logos/barca.svg',
  },
};

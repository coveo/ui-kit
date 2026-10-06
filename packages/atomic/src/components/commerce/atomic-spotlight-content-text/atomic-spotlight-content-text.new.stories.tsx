import type {Meta, StoryObj as Story} from '@storybook/web-components-vite';
import {getStorybookHelpers} from '@wc-toolkit/storybook-helpers';
import {MockCommerceApi} from '@coveo/platform-mock-api/commerce';
import {wrapInCommerceInterface} from '@/storybook-utils/commerce/commerce-interface-wrapper';
import {wrapInCommerceProductList} from '@/storybook-utils/commerce/commerce-product-list-wrapper';
import {wrapInSpotlightContentTemplate} from '@/storybook-utils/commerce/commerce-spotlight-content-template-wrapper';
import {
  enableSpotlightContent,
  spotlightContentTransformer,
} from '@/storybook-utils/commerce/spotlight-content';
import {parameters} from '@/storybook-utils/common/common-meta-parameters';
import '@/src/components/commerce/atomic-commerce-interface/atomic-commerce-interface.js';
import '@/src/components/commerce/atomic-spotlight-content-text/atomic-spotlight-content-text.js';

const commerceApiHarness = new MockCommerceApi();
commerceApiHarness.searchEndpoint.addRequestTransformer(spotlightContentTransformer([0, 2]));

const {decorator: commerceInterfaceDecorator, play: initializeCommerceInterface} =
  wrapInCommerceInterface({
    engineConfig: {
      preprocessRequest: (request) => {
        const parsed = JSON.parse(request.body as string);
        parsed.perPage = 2;
        request.body = JSON.stringify(parsed);
        return request;
      },
    },
    includeCodeRoot: false,
  });

const {decorator: commerceProductListDecorator} = wrapInCommerceProductList('grid', false);
const {decorator: spotlightContentTemplateDecorator} = wrapInSpotlightContentTemplate();
const {events, args, argTypes, template} = getStorybookHelpers('atomic-spotlight-content-text', {
  excludeCategories: ['methods'],
  containerSelector: 'atomic-spotlight-content-template template',
});

const meta: Meta = {
  component: 'atomic-spotlight-content-text',
  title: 'Commerce/Spotlight Content Text',
  id: 'atomic-spotlight-content-text',
  render: (args) => template(args),
  decorators: [
    spotlightContentTemplateDecorator,
    commerceProductListDecorator,
    commerceInterfaceDecorator,
  ],
  parameters: {
    ...parameters,
    msw: {handlers: [...commerceApiHarness.handlers]},
    actions: {
      handles: events,
    },
  },
  args,
  argTypes,
  play: async (context) => {
    await enableSpotlightContent(context);
    await initializeCommerceInterface(context);
  },
  beforeEach: () => {
    commerceApiHarness.clearAll();
  },
};

export default meta;

export const Default: Story = {
  name: 'atomic-spotlight-content-text',
  args: {
    field: 'name',
  },
};

export const Description: Story = {
  name: 'Displaying the description',
  args: {
    field: 'description',
  },
};

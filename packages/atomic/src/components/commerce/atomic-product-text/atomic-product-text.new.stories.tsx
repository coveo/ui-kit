import type {Meta, StoryObj as Story} from '@storybook/web-components-vite';
import {getStorybookHelpers} from '@wc-toolkit/storybook-helpers';
import {wrapInCommerceInterface} from '@/storybook-utils/commerce/commerce-interface-wrapper';
import {wrapInCommerceProductList} from '@/storybook-utils/commerce/commerce-product-list-wrapper';
import {wrapInProductTemplate} from '@/storybook-utils/commerce/commerce-product-template-wrapper';
import {parameters} from '@/storybook-utils/common/common-meta-parameters';
import {updateQuery} from '../../../../../headless/src/features/commerce/query/query-actions';

const {
  decorator: commerceInterfaceDecorator,
  play: initializeCommerceInterface,
} = wrapInCommerceInterface({
  skipFirstRequest: true,
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
  undefined,
  false
);
const {decorator: productTemplateDecorator} = wrapInProductTemplate();
const {events, args, argTypes, template} = getStorybookHelpers(
  'atomic-product-text',
  {
    excludeCategories: ['methods'],
    containerSelector: 'atomic-product-template template',
  }
);

const meta: Meta = {
  component: 'atomic-product-text',
  title: 'Commerce/Product Text',
  id: 'atomic-product-text',
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
  args,
  argTypes,
};

export default meta;

export const Default: Story = {
  name: 'atomic-product-text',
  play: async (context) => {
    await initializeCommerceInterface(context);

    const searchInterface = context.canvasElement.querySelector(
      'atomic-commerce-interface'
    );
    searchInterface?.engine?.dispatch(updateQuery({query: 'kayak'}));

    await searchInterface!.executeFirstRequest();
  },
  args: {
    field: 'excerpt',
  },
};

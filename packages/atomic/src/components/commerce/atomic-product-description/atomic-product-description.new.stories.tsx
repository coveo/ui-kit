import {wrapInCommerceInterface} from '@/storybook-utils/commerce/commerce-interface-wrapper';
import {wrapInCommerceProductList} from '@/storybook-utils/commerce/commerce-product-list-wrapper';
import {wrapInProductTemplate} from '@/storybook-utils/commerce/commerce-product-template-wrapper';
import {parameters} from '@/storybook-utils/common/common-meta-parameters';
import {renderComponent} from '@/storybook-utils/common/render-component';
import type {Meta, StoryObj as Story} from '@storybook/web-components';
import {updateQuery} from '../../../../../headless/src/features/commerce/query/query-actions';

const {
  decorator: commerceInterfaceDecorator,
  play: initializeCommerceInterface,
} = wrapInCommerceInterface({
  skipFirstRequest: true,
});

const {decorator: commerceProductListDecorator} = wrapInCommerceProductList();
const {decorator: productTemplateDecorator} = wrapInProductTemplate();

const meta: Meta = {
  component: 'atomic-product-description',
  title: 'Atomic-Commerce/Product Template Components/ProductDescription',
  id: 'atomic-product-description',
  render: renderComponent,
  parameters,
  argTypes: {
    'attributes-truncate-after': {
      name: 'truncate-after',
      type: 'string',
    },
    'attributes-field': {
      name: 'field',
      type: 'string',
    },
    'attributes-is-collapsible': {
      name: 'is-collapsible',
      type: 'boolean',
    },
  },
};

export default meta;

export const Default: Story = {
  name: 'atomic-product-description',
  parameters: {
    viewport: {
      defaultViewport: 'mobile1',
    },
  },
  decorators: [
    productTemplateDecorator,
    commerceProductListDecorator,
    commerceInterfaceDecorator,
  ],
  play: async (context) => {
    await initializeCommerceInterface(context);

    const searchInterface = context.canvasElement.querySelector(
      'atomic-commerce-interface'
    );
    searchInterface?.engine?.dispatch(updateQuery({query: 'boat'}));

    await searchInterface!.executeFirstRequest();
  },
  args: {
    'attributes-field': 'ec_description',
  },
};

import {wrapInCommerceInterface} from '@coveo/atomic-storybook-utils/commerce/commerce-interface-wrapper';
import {wrapInCommerceProductList} from '@coveo/atomic-storybook-utils/commerce/commerce-product-list-wrapper';
import {wrapInProductTemplate} from '@coveo/atomic-storybook-utils/commerce/commerce-product-template-wrapper';
import {parameters} from '@coveo/atomic-storybook-utils/common/common-meta-parameters';
import {renderComponent} from '@coveo/atomic-storybook-utils/common/render-component';
import type {Meta, StoryObj as Story} from '@storybook/web-components';
import {updateQuery} from '../../../../../../headless/src/features/commerce/query/query-actions';

const {
  decorator: commerceInterfaceDecorator,
  play: initializeCommerceInterface,
} = wrapInCommerceInterface({
  skipFirstSearch: true,
});

const {decorator: commerceProductListDecorator} = wrapInCommerceProductList();
const {decorator: productTemplateDecorator} = wrapInProductTemplate();

const meta: Meta = {
  component: 'atomic-product-text',
  title: 'Atomic-Commerce/Product Template Components/ProductText',
  id: 'atomic-product-text',
  render: renderComponent,
  parameters,
  argTypes: {
    'attributes-default': {
      name: 'default',
      type: 'string',
    },
    'attributes-field': {
      name: 'field',
      type: 'string',
    },
    'attributes-should-highlight': {
      name: 'should-highlight',
      type: 'boolean',
    },
  },
};

export default meta;

export const Default: Story = {
  name: 'atomic-product-text',
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
    searchInterface?.engine?.dispatch(updateQuery({query: 'kayak'}));

    await searchInterface!.executeFirstRequest();
  },
  args: {
    'attributes-field': 'excerpt',
  },
};

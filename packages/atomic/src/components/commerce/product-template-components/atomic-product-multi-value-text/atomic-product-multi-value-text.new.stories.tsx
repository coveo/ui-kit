import {wrapInCommerceInterface} from '@coveo/atomic/storybookUtils/commerce/commerce-interface-wrapper';
import {parameters} from '@coveo/atomic/storybookUtils/common/common-meta-parameters';
import {renderComponent} from '@coveo/atomic/storybookUtils/common/render-component';
import {wrapInProduct} from '@coveo/atomic/storybookUtils/product-wrapper';
import type {Meta, StoryObj as Story} from '@storybook/web-components';

const {decorator: productDecorator} = wrapInProduct();
const {decorator: commerceInterfaceDecorator, play} = wrapInCommerceInterface({
  skipFirstSearch: false,
});

const meta: Meta = {
  component: 'atomic-product-multi-value-text',
  title: 'Atomic-Commerce/Product Template Components/MultiValueText',
  id: 'atomic-product-multi-value-text',
  render: renderComponent,
  decorators: [productDecorator, commerceInterfaceDecorator],
  parameters,
  play,
};

export default meta;

export const Default: Story = {
  name: 'atomic-product-multi-value-text',
  args: {
    'attributes-field': 'ec_category',
  },
};

export const WithMaxValuesToDisplay: Story = {
  name: 'With max values to display',
  args: {
    'attributes-field': 'ec_category',
    'attributes-max-values-to-display': 1,
  },
};

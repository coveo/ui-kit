import {Meta, StoryObj as Story} from '@storybook/web-components';
import {wrapInProduct} from '../../../../../storybookUtils/commerce/atomic-commerce-product-wrapper';
import {wrapInCommerceInterface} from '../../../../../storybookUtils/commerce/commerce-interface-wrapper';
import {parameters} from '../../../../../storybookUtils/common/common-meta-parameters';
import {renderComponent} from '../../../../../storybookUtils/common/render-component';

const {decorator: resultDecorator, engineConfig} = wrapInProduct();
const {decorator: searchInterfaceDecorator, play} = wrapInCommerceInterface({
  engineConfig,
  type: 'search',
});

const meta: Meta = {
  component: 'atomic-product-image',
  title: 'Atomic-Commerce/Product Template Components/ProductImage',
  id: 'atomic-product-image',
  render: renderComponent,
  decorators: [resultDecorator, searchInterfaceDecorator],
  parameters,
  play,
};

export default meta;

export const Default: Story = {
  name: 'atomic-product-image',
};

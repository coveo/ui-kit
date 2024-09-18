import {wrapInCommerceProductList} from '@coveo/atomic/storybookUtils/commerce/commerce-product-list-wrapper';
import {parameters} from '@coveo/atomic/storybookUtils/common/common-meta-parameters';
import {renderComponent} from '@coveo/atomic/storybookUtils/common/render-component';
import type {Meta, StoryObj as Story} from '@storybook/web-components';
import {html} from 'lit-html';
import {wrapInCommerceInterface} from '../../../../../storybookUtils/commerce/commerce-interface-wrapper';

const {
  decorator: commerceInterfaceDecorator,
  play: initializeCommerceInterface,
} = wrapInCommerceInterface({skipFirstSearch: false});
const {decorator} = wrapInCommerceProductList();

const meta: Meta = {
  component: 'atomic-product-link',
  title: 'Atomic-Commerce/ProductLink',
  id: 'atomic-product-link',
  render: renderComponent,
  decorators: [decorator, commerceInterfaceDecorator],
  parameters,
  play: initializeCommerceInterface,
};

export default meta;

export const Default: Story = {
  name: 'atomic-product-link',
};

export const WithSlotsAttributes: Story = {
  name: 'opens in a new browser tab',
  decorators: [
    () => {
      return html`
        <atomic-product-link>
          <a slot="attributes" target="_blank"></a>
        </atomic-product-link>
      `;
    },
  ],
};

export const WithAlternativeContent: Story = {
  name: 'with alternative content',
  decorators: [
    (_) => {
      return html`
        <atomic-product-link>
          <div>
            Alternative content
            <img src="https://picsum.photos/350" class="thumbnail" />
          </div>
        </atomic-product-link>
      `;
    },
  ],
};

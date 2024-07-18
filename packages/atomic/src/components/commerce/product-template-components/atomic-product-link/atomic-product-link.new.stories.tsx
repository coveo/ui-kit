import {wrapInCommerceProductList} from '@coveo/atomic/storybookUtils/commerce-interface-wrapper';
import {parameters} from '@coveo/atomic/storybookUtils/common-meta-parameters';
import {renderProductComponent} from '@coveo/atomic/storybookUtils/render-component';
import type {Meta, StoryObj as Story} from '@storybook/web-components';
import {html} from 'lit-html';

const {decorator, play} = wrapInCommerceProductList({});

const meta: Meta = {
  component: 'atomic-product-link',
  title: 'Atomic-Commerce/ProductLink',
  id: 'atomic-product-link',
  render: renderProductComponent,
  decorators: [decorator],
  parameters,
  play,
};

export default meta;

export const Default: Story = {
  name: 'atomic-product-link',
};

export const WithSlotsAttributes: Story = {
  name: 'opens in a new browser tab',
  decorators: [
    (_) => {
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

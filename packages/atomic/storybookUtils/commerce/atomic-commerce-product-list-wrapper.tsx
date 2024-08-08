import {Decorator} from '@storybook/web-components';
import {html} from 'lit-html/static.js';

export const wrapInCommerceProductList = (): {
  decorator: Decorator;
} => ({
  decorator: (story) => html`
    <atomic-commerce-product-list
      id="code-root"
      number-of-placeholders="24"
      display="grid"
      density="normal"
      image-size="small"
    >
      ${story()}
    </atomic-commerce-product-list>
  `,
});

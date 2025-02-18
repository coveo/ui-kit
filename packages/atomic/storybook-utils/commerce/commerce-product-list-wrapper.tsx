import {Decorator} from '@storybook/web-components';
import {html} from 'lit';

export const wrapInCommerceProductList = (): {
  decorator: Decorator;
} => ({
  decorator: (story) => html`
    <atomic-commerce-product-list
      id="code-root"
      number-of-placeholders="24"
      display="list"
      density="compact"
      image-size="small"
    >
      ${story()}
    </atomic-commerce-product-list>
  `,
});

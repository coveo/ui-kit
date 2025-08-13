import {Decorator} from '@storybook/web-components-vite';
import {html} from 'lit';

export const wrapInCommerceProductList = (display?: string): {
  decorator: Decorator;
} => ({
  decorator: (story) => html`
    <atomic-commerce-product-list
      id="code-root"
      display="${display ?? 'list'}"
      number-of-placeholders="24"
      density="compact"
      image-size="small"
    >
      ${story()}
    </atomic-commerce-product-list>
  `,
});

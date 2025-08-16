import { spreadProps } from '@open-wc/lit-helpers';
import {Decorator} from '@storybook/web-components-vite';
import {html} from 'lit';

export const wrapInCommerceProductList = (display: string='list', includeCodeRoot: boolean = true): {
  decorator: Decorator;
} => ({
  decorator: (story) => html`
    <atomic-commerce-product-list
      ${spreadProps(includeCodeRoot?{id:"code-root"}:{})}
      display=${display}
      number-of-placeholders="24"
      density="compact"
      image-size="small"
    >
      ${story()}
    </atomic-commerce-product-list>
  `,
});

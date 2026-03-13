import '@/src/components/commerce/atomic-commerce-product-list/atomic-commerce-product-list.js';
import { ItemDisplayLayout } from '@/src/components/common/layout/item-layout-utils';
import { spreadProps } from '@open-wc/lit-helpers';
import {Decorator} from '@storybook/web-components-vite';
import {html} from 'lit';
import { ifDefined } from 'lit/directives/if-defined.js';

export const wrapInCommerceProductList = (display: ItemDisplayLayout = 'list', includeCodeRoot: boolean = true, style?: string): {
  decorator: Decorator;
} => ({
  decorator: (story) => html`
    <atomic-commerce-product-list
      ${spreadProps(includeCodeRoot?{id:"code-root"}:{})}
      display=${display}
      number-of-placeholders="24"
      density="normal"
      image-size="small"
      style=${ifDefined(style)}
    >
      ${story()}
    </atomic-commerce-product-list>
  `,
});

import { spreadProps } from '@open-wc/lit-helpers';
import {Decorator} from '@storybook/web-components-vite';
import {html} from 'lit';

export const wrapInCommerceSearchBoxInstantProducts = (includeCodeRoot: boolean = true): {
  decorator: Decorator;
} => ({
  decorator: (story) => html`
  <div style="min-width: 600px;">
    <atomic-commerce-search-box
      data-testid="search-box"
      suggestion-timeout="30000"
    >
      <atomic-commerce-search-box-query-suggestions></atomic-commerce-search-box-query-suggestions>
      <atomic-commerce-search-box-instant-products
        ${spreadProps(includeCodeRoot?{id:"code-root"}:{})}
        image-size="small"
      >
        ${story()}
      </atomic-commerce-search-box-instant-products>
    </atomic-commerce-search-box>
    <atomic-commerce-query-error></atomic-commerce-query-error>
  </div>
  `,
});

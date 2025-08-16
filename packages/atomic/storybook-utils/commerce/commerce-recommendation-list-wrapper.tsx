import { spreadProps } from '@open-wc/lit-helpers';
import {Decorator} from '@storybook/web-components-vite';
import {html} from 'lit';

export const wrapInCommerceRecommendationList = (includeCodeRoot: boolean = true): {
  decorator: Decorator;
} => ({
  decorator: (story) => html`
    <atomic-commerce-recommendation-list
      ${spreadProps(includeCodeRoot?{id:"code-root"}:{})}
      slot-id="af4fb7ba-6641-4b67-9cf9-be67e9f30174"
      products-per-page="3"
    >
      ${story()}
    </atomic-commerce-recommendation-list>
  `,
});

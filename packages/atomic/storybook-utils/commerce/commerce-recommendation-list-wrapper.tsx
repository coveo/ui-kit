import {Decorator} from '@storybook/web-components';
import {html} from 'lit';
// TODO: Remove this import once atomic-commerce-recommendation-list is merged;
import '../../src/components/commerce/atomic-product/atomic-product';

export const wrapInCommerceRecommendationList = (): {
  decorator: Decorator;
} => ({
  decorator: (story) => html`
    <atomic-commerce-recommendation-list
      id="code-root"
      slot-id="af4fb7ba-6641-4b67-9cf9-be67e9f30174"
      products-per-page="3"
    >
      ${story()}
    </atomic-commerce-recommendation-list>
  `,
});

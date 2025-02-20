import {Decorator} from '@storybook/web-components';
import {html} from 'lit';

export const wrapInCommerceSearchBoxInstantProducts = (): {
  decorator: Decorator;
} => ({
  decorator: (story) => html`
    <atomic-commerce-search-box
      data-testid="search-box"
      suggestion-timeout="30000"
    >
      <atomic-commerce-search-box-query-suggestions></atomic-commerce-search-box-query-suggestions>
      <atomic-commerce-search-box-instant-products
        id="code-root"
        image-size="small"
      >
        ${story()}
      </atomic-commerce-search-box-instant-products>
    </atomic-commerce-search-box>
    <atomic-commerce-query-error></atomic-commerce-query-error>
  `,
});

import {Decorator} from '@storybook/web-components';
import {html} from 'lit';

export const wrapInCommerceSearchBox = (): {
  decorator: Decorator;
} => ({
  decorator: (story) => html`
    <atomic-commerce-search-box id="code-root">
      ${story()}
    </atomic-commerce-search-box>
  `,
});

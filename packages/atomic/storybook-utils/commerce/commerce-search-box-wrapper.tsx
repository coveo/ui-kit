import {Decorator} from '@storybook/web-components';
import {html, TemplateResult} from 'lit';

export const wrapInCommerceSearchBox = (
  extra?: TemplateResult
): {
  decorator: Decorator;
} => ({
  decorator: (story) => html`
    <atomic-commerce-search-box suggestion-timeout="5000" id="code-root">
      ${extra} ${story()}
    </atomic-commerce-search-box>
  `,
});

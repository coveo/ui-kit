import {Decorator} from '@storybook/web-components';
import {html, TemplateResult} from 'lit';

export const wrapInCommerceSearchBox = (
  extra?: TemplateResult
): {
  decorator: Decorator;
} => ({
  decorator: (story) => html`
    <div id="code-root">
      <atomic-commerce-search-box suggestion-timeout="5000">
        ${extra} ${story()}
      </atomic-commerce-search-box>
    </div>
  `,
});

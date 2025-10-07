import { spreadProps } from '@open-wc/lit-helpers';
import {Decorator} from '@storybook/web-components-vite';
import {html, TemplateResult} from 'lit';

export const wrapInSearchBox = (
  extra?: TemplateResult,
  includeCodeRoot: boolean = true
): {
  decorator: Decorator;
} => ({
  decorator: (story) => html`
    <div>
      <div style="min-width: 600px;">
      <atomic-search-box suggestion-timeout="5000">
        ${extra} <div ${spreadProps(includeCodeRoot?{id:"code-root"}:{})}>${story()}</div>
      </atomic-search-box>
      </div>
    </div>
  `,
});
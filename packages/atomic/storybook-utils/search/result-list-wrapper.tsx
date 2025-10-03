import { spreadProps } from '@open-wc/lit-helpers';
import {Decorator} from '@storybook/web-components-vite';
import {html} from 'lit';

export const wrapInResultList = (display: string = 'list', includeCodeRoot: boolean = true): {
  decorator: Decorator;
} => ({
  decorator: (story) => html`
    <atomic-result-list
      ${spreadProps(includeCodeRoot?{id:"code-root"}:{})}
      display=${display}
      number-of-placeholders="24"
      density="compact"
      image-size="small"
    >
      ${story()}
    </atomic-result-list>
  `,
});

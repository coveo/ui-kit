import { ItemDisplayLayout } from '@/src/components/common/layout/display-options';
import { spreadProps } from '@open-wc/lit-helpers';
import {Decorator} from '@storybook/web-components-vite';
import {html} from 'lit';
import { ifDefined } from 'lit/directives/if-defined.js';

export const wrapInResultList = (display: ItemDisplayLayout = 'list', includeCodeRoot: boolean = true, style?: string): {
  decorator: Decorator;
} => ({
  decorator: (story) => html`
    <atomic-result-list
      ${spreadProps(includeCodeRoot?{id:"code-root"}:{})}
      display=${display}
      number-of-placeholders="24"
      density="compact"
      image-size="small"
      style=${ifDefined(style)}
    >
      ${story()}
    </atomic-result-list>
  `,
});

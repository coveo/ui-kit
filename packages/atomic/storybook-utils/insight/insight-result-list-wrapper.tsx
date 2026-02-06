import {ItemDisplayLayout} from '@/src/components/common/layout/display-options';
import {spreadProps} from '@open-wc/lit-helpers';
import {Decorator} from '@storybook/web-components-vite';
import {html} from 'lit';
import {ifDefined} from 'lit/directives/if-defined.js';

export const wrapInInsightResultList = (
  display: ItemDisplayLayout = 'list',
  includeCodeRoot: boolean = true,
  style?: string
): {
  decorator: Decorator;
} => ({
  decorator: (story) => html`
    <atomic-insight-result-list
      ${spreadProps(includeCodeRoot ? {id: 'code-root'} : {})}
      display=${display}
      number-of-placeholders="24"
      density="compact"
      image-size="small"
      style=${ifDefined(style)}
    >
      ${story()}
    </atomic-insight-result-list>
  `,
});

export const wrapInInsightFoldedResultList = (
  display: ItemDisplayLayout = 'list',
  includeCodeRoot: boolean = true,
  style?: string
): {
  decorator: Decorator;
} => ({
  decorator: (story) => html`
    <atomic-insight-folded-result-list
      ${spreadProps(includeCodeRoot ? {id: 'code-root'} : {})}
      display=${display}
      number-of-placeholders="24"
      density="compact"
      image-size="small"
      style=${ifDefined(style)}
    >
      ${story()}
    </atomic-insight-folded-result-list>
  `,
});

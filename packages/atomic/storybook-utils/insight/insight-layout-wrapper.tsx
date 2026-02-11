import {spreadProps} from '@open-wc/lit-helpers';
import {Decorator} from '@storybook/web-components-vite';
import {html} from 'lit';

export const wrapInInsightLayout = (
  includeCodeRoot: boolean = true
): {
  decorator: Decorator;
} => ({
  decorator: (story) => html`
    <atomic-insight-layout>
      <atomic-insight-refine-modal></atomic-insight-refine-modal>
      <atomic-layout-section section="main">
        <atomic-layout-section section="horizontal">
          <atomic-layout-section
            section="results"
            ${spreadProps(includeCodeRoot ? {id: 'code-root'} : {})}
          >
            ${story()}
          </atomic-layout-section>
        </atomic-layout-section>
      </atomic-layout-section>
    </atomic-insight-layout>
    <atomic-quickview-modal></atomic-quickview-modal>
  `,
});

import {html, type TemplateResult} from 'lit';
import {when} from 'lit/directives/when.js';
import type {FunctionalComponent} from '@/src/utils/functional-component-utils';

interface FacetPlaceholderProps {
  numberOfValues: number;
  isCollapsed: boolean;
}

export const renderFacetPlaceholder: FunctionalComponent<
  FacetPlaceholderProps
> = ({props}) => {
  const facetValues: TemplateResult[] = [];
  for (let i = 0; i < props.numberOfValues; i++) {
    facetValues.push(
      html`<div
        class="bg-neutral mt-4 flex h-5"
        style="width: 100%; opacity: 0.5"
      ></div>`
    );
  }

  return html`<div
    part="placeholder"
    class="bg-background border-neutral mb-4 animate-pulse rounded-lg border p-7"
    aria-hidden="true"
  >
    <div class="bg-neutral h-8 rounded" style="width: 75%"></div>
    ${when(!props.isCollapsed, () => html`<div class="mt-7">${facetValues}</div>`)}
  </div>`;
};

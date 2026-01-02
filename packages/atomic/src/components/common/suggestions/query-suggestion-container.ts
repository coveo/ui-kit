import {html} from 'lit';
import type {FunctionalComponentWithChildren} from '@/src/utils/functional-component-utils';

export const renderQuerySuggestionContainer: FunctionalComponentWithChildren =
  () => (children) => {
    return html`<div
      part="query-suggestion-content"
      class="pointer-events-none flex items-center"
    >
      ${children}
    </div>`;
  };

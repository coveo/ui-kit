import {html} from 'lit';
import type {FunctionalComponentWithChildrenNoProps} from '@/src/utils/functional-component-utils';

export const renderQuerySuggestionContainer: FunctionalComponentWithChildrenNoProps =
  () => (children) => {
    return html`<div
      part="query-suggestion-content"
      class="pointer-events-none flex items-center"
    >
      ${children}
    </div>`;
  };

import {html, nothing} from 'lit';
import {Directive, directive} from 'lit/directive.js';

export interface RefineToggleGuardProps {
  hasError: boolean;
  firstRequestExecuted: boolean;
  hasItems: boolean;
}

class RefineToggleGuardDirective extends Directive {
  render(
    {hasError, firstRequestExecuted, hasItems}: RefineToggleGuardProps,
    content: () => unknown
  ) {
    if (hasError) {
      return nothing;
    }

    if (!firstRequestExecuted) {
      return html`
        <div
          part="placeholder"
          aria-hidden="true"
          class="bg-neutral mb-4 h-12 w-26 animate-pulse rounded"
        ></div>
      `;
    }

    if (!hasItems) {
      return nothing;
    }

    return html`${content()}`;
  }
}

export const refineToggleGuard = directive(RefineToggleGuardDirective);

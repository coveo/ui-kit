import {html, nothing} from 'lit';
import {Directive, directive} from 'lit/directive.js';

interface NoItemsGuardProps {
  firstSearchExecuted: boolean;
  isLoading: boolean;
  hasResults: boolean;
}

class NoItemsGuardDirective extends Directive {
  render(
    {firstSearchExecuted, isLoading, hasResults}: NoItemsGuardProps,
    content: () => unknown
  ) {
    if (!firstSearchExecuted || isLoading || hasResults) {
      return nothing;
    }

    return html`${content()}`;
  }
}

export const noItemsGuard = directive(NoItemsGuardDirective);

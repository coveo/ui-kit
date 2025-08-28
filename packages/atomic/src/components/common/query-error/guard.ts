import {html, nothing} from 'lit';
import {Directive, directive} from 'lit/directive.js';

interface QueryErrorGuardProps {
  hasError: boolean;
}

class QueryErrorGuardDirective extends Directive {
  render({hasError}: QueryErrorGuardProps, content: () => unknown) {
    if (!hasError) {
      return nothing;
    }

    return html`${content()}`;
  }
}

export const renderQueryErrorGuard = directive(QueryErrorGuardDirective);

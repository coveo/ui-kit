import {html, TemplateResult} from 'lit';
import {directive, Directive} from 'lit/directive.js';

interface SortGuardProps {
  firstSearchExecuted: boolean;
}

// TODO: test with a simple function instead of a custom directive
class SortGuardDirective extends Directive {
  render(
    {firstSearchExecuted}: SortGuardProps,
    sortTemplate: () => TemplateResult
  ): TemplateResult {
    if (!firstSearchExecuted) {
      return html`
        <div
          part="placeholder"
          aria-hidden="true"
          class="bg-neutral my-2 h-6 w-44 animate-pulse rounded"
        ></div>
      `;
    }
    return sortTemplate();
  }
}

const sortGuardDirective = directive(SortGuardDirective);

export const sortGuard = (
  props: SortGuardProps,
  sortTemplate: () => TemplateResult
) => {
  return sortGuardDirective(props, sortTemplate);
};

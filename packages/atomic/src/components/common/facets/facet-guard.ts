import {displayIf} from '@/src/directives/display-if';
import {directive, Directive} from 'lit/directive.js';

interface FacetGuardDirectiveProps {
  enabled: boolean;
  hasError: boolean;
  firstRequestExecuted: boolean;
  hasResults: boolean;
}

class FacetGuardDirective extends Directive {
  render(
    {
      enabled,
      firstRequestExecuted,
      hasError,
      hasResults,
    }: FacetGuardDirectiveProps,
    children: () => unknown
  ) {
    const shouldDisplay =
      enabled && !hasError && firstRequestExecuted && hasResults;
    return displayIf(shouldDisplay, children);
  }
}

export const facetGuard = directive(FacetGuardDirective);

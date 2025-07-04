import {html, noChange, nothing, type TemplateResult} from 'lit';

interface SortGuardProps {
  firstSearchExecuted: boolean;
  hasResults: boolean;
  hasError: boolean;
  isLoading: boolean;
}

const placeholder = () => html`
  <div
    part="placeholder"
    aria-hidden="true"
    class="bg-neutral my-2 h-6 w-44 animate-pulse rounded"
  ></div>
`;

export const sortGuard = (
  {firstSearchExecuted, hasError, hasResults, isLoading}: SortGuardProps,
  sortTemplate: () => TemplateResult
) => {
  if (hasError) {
    return nothing;
  }
  if (!firstSearchExecuted) {
    return placeholder();
  }
  if (isLoading) {
    return noChange;
  }
  if (!hasResults) {
    return nothing;
  }
  return sortTemplate();
};

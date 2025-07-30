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
    class="bg-neutral mb-4 h-10 w-64 animate-pulse rounded"
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

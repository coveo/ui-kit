import {html, TemplateResult} from 'lit';

interface SortGuardProps {
  firstSearchExecuted: boolean;
}

export const sortGuard = (
  {firstSearchExecuted}: SortGuardProps,
  sortTemplate: () => TemplateResult
): TemplateResult => {
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
};

import {html, TemplateResult} from 'lit';

export const renderSortContainer = (
  ...children: TemplateResult[]
): TemplateResult => {
  return html`
    <div class="text-on-background flex flex-wrap items-center">
      ${children}
    </div>
  `;
};

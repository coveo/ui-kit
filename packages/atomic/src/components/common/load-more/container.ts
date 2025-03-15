import {html, TemplateResult} from 'lit';

export const loadMoreContainer = (children: TemplateResult) =>
  html`<div class="flex flex-col items-center" part="container">
    ${children}
  </div>`;

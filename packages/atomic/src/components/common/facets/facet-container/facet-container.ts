import {html} from 'lit';

export const facetContainer = (content: unknown) => html`
  <div class="bg-background border-neutral rounded-lg border p-4" part="facet">
    ${content}
  </div>
`;

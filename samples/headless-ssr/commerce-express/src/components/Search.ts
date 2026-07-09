import type {SearchBox} from '@coveo/headless/ssr-commerce';
import {escapeHtml, getElement} from '../common/utils.js';

/**
 * Search box. The form is rendered on every page (submitting GETs to
 * `/search`), but only hydrated on the search page, where a `searchBox`
 * controller exists — listing pages fall back to the native form submit.
 */
export function renderSearch(value: string): string {
  return `
    <form class="SearchBox" method="GET" action="/search" role="search">
      <div class="SearchBoxField">
        <input
          type="search"
          id="search-input"
          class="SearchBoxInput"
          name="q"
          placeholder="Search for products..."
          value="${escapeHtml(value)}"
          aria-label="Search for products"
        />
      </div>
      <button id="search-button" class="SearchBoxSubmit" type="submit">Search</button>
    </form>
  `;
}

export function hydrateSearch(searchBox: SearchBox) {
  const input = getElement<HTMLInputElement>('search-input');
  const form = input?.form;
  if (!input || !form) return;

  const update = () => {
    input.value = searchBox.state?.value ?? '';
  };

  searchBox.subscribe(update);
  update();

  // Submitting runs the query. The URL is kept in sync by the parameter
  // manager (see components/ParameterManager.ts).
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    searchBox.updateText(input.value.trim());
    searchBox.submit();
  });
}

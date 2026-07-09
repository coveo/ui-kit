import type {SearchBox} from '@coveo/headless/ssr-commerce';
import {getElement} from '../common/utils.js';

export function Search(searchBox: SearchBox) {
  if (!searchBox) return;

  const input = getElement<HTMLInputElement>('search-input');
  const form = input?.form;
  if (!input || !form) return;

  const render = () => {
    input.value = selectSearchValue(searchBox);
  };

  searchBox.subscribe(render);
  render();

  // Submitting runs the query. The URL is kept in sync by the ParameterManager
  // component (see components/ParameterManager.ts).
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const query = input.value.trim();
    searchBox.updateText(query);
    searchBox.submit();
  });
}

export function selectSearchValue(searchBox: SearchBox): string {
  return searchBox?.state?.value ?? '';
}

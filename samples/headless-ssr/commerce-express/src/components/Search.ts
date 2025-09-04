import type {SearchBox} from '@coveo/headless/ssr-commerce-next';
import {getElement, updateQueryParam} from '../common/utils.js';

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

  const handleSubmit = (event: Event) => {
    event.preventDefault();
    const query = input.value.trim();

    updateQueryParam('q', query);

    searchBox.updateText(query);
    searchBox.submit();
  };

  form.addEventListener('submit', handleSubmit);
}

export function selectSearchValue(searchBox: SearchBox): string {
  return searchBox?.state?.value ?? '';
}

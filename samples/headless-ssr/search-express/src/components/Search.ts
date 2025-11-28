import type {SearchBox} from '@coveo/headless/ssr-next';
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

    if (query === '') {
      // For empty queries, don't add ?q= to URL, just remove it
      updateQueryParam('q', '');
      // Don't call searchBox.updateText or submit for empty queries
      // This prevents the URL from being updated with ?q=
      return;
    }

    updateQueryParam('q', query);

    searchBox.updateText(query);
    searchBox.submit();
  };

  form.addEventListener('submit', handleSubmit);
}

export function selectSearchValue(searchBox: SearchBox): string {
  return searchBox?.state?.value ?? '';
}

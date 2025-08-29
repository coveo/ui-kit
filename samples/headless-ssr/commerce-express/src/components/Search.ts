import type {SearchBox} from '@coveo/headless/ssr-commerce-next';
import {getElement} from '../common/utils.js';

export function Search(searchBox: SearchBox) {
  if (!searchBox) return;

  const input = getElement<HTMLInputElement>('search-input');
  const button = getElement<HTMLButtonElement>('search-button');
  if (!input || !button) return;

  // Initial value
  input.value = selectSearchValue(searchBox);

  searchBox.subscribe(() => {
    input.value = selectSearchValue(searchBox);
  });
}

export function selectSearchValue(searchBox: SearchBox): string {
  return searchBox?.state?.value || '';
}

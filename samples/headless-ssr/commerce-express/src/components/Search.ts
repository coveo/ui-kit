import type {SearchBox} from '@coveo/headless/ssr-commerce-next';
import {getElement} from '../common/utils.js';

export function Search(searchBox: SearchBox) {
  if (!searchBox) return;

  const input = getElement<HTMLInputElement>('search-input');
  if (!input) return;
  const form = input.form;
  if (!form) return;

  function render() {
    if (!input) return;
    input.value = selectSearchValue(searchBox);
  }

  searchBox.subscribe(render);
  render();

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    searchBox.updateText(input.value);
    searchBox.submit();
  });
}

export function selectSearchValue(searchBox: SearchBox): string {
  return searchBox?.state?.value || '';
}

import {
  type Sort as SortController,
  SortBy,
  type SortCriterion,
} from '@coveo/headless/ssr-commerce';
import {escapeHtml, getElement} from '../common/utils.js';

type SortState = SortController['state'];

export function selectSort(sort: SortController): SortState {
  return sort.state;
}

function getSortLabel(criterion: SortCriterion): string {
  switch (criterion.by) {
    case SortBy.Relevance:
      return 'Relevance';
    case SortBy.Fields:
      return criterion.fields
        .map(
          (field) =>
            field.displayName ?? `${field.name} ${field.direction ?? ''}`.trim()
        )
        .join(', ');
    default:
      return 'Sort';
  }
}

export function renderSort(state: SortState): string {
  if (state.availableSorts.length === 0) {
    return '';
  }

  const appliedValue = JSON.stringify(state.appliedSort);
  const options = state.availableSorts
    .map((sort) => {
      const value = JSON.stringify(sort);
      const selected = value === appliedValue ? ' selected' : '';
      return `<option value="${escapeHtml(value)}"${selected}>${escapeHtml(getSortLabel(sort))}</option>`;
    })
    .join('');

  return `
    <label for="sort-select">Sort by</label>
    <select id="sort-select" name="sorts">${options}</select>
  `;
}

export function Sort(sort: SortController) {
  if (!sort) return;

  const container = getElement<HTMLElement>('sort');
  if (!container) return;

  const render = () => {
    const {state} = sort;
    const hasSorts = state.availableSorts.length > 0;
    container.style.display = hasSorts ? 'flex' : 'none';
    container.innerHTML = hasSorts ? renderSort(state) : '';
  };

  sort.subscribe(render);
  render();

  container.addEventListener('change', (event) => {
    const target = event.target as HTMLSelectElement;
    if (target?.id === 'sort-select') {
      sort.sortBy(JSON.parse(target.value) as SortCriterion);
    }
  });
}

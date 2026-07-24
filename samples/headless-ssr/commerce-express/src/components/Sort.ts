import {
  type Sort as SortController,
  SortBy,
  type SortCriterion,
} from '@coveo/headless/ssr-commerce';
import {escapeHtml, getElement} from '../common/utils.js';

type SortState = SortController['state'];

function hasSorts(state: SortState): boolean {
  return state.availableSorts.length > 0;
}

function getSortLabel(criterion: SortCriterion): string {
  switch (criterion.by) {
    case SortBy.Relevance:
      return 'Relevance';
    case SortBy.Fields:
      return criterion.fields
        .map((field) => field.displayName ?? `${field.name} ${field.direction ?? ''}`.trim())
        .join(', ');
    default:
      return 'Sort';
  }
}

/** The label + select. Assumes at least one available sort. */
function renderSortControl(state: SortState): string {
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

export function renderSort(state: SortState): string {
  const visible = hasSorts(state);
  return `<div id="sort" class="Sort" style="display: ${visible ? 'flex' : 'none'};">${
    visible ? renderSortControl(state) : ''
  }</div>`;
}

export function hydrateSort(sort: SortController) {
  const container = getElement<HTMLElement>('sort');
  if (!container) return;

  const update = () => {
    const visible = hasSorts(sort.state);
    container.style.display = visible ? 'flex' : 'none';
    container.innerHTML = visible ? renderSortControl(sort.state) : '';
  };

  sort.subscribe(update);
  update();

  container.addEventListener('change', (event) => {
    const target = event.target as HTMLSelectElement;
    if (target?.id === 'sort-select') {
      sort.sortBy(JSON.parse(target.value) as SortCriterion);
    }
  });
}

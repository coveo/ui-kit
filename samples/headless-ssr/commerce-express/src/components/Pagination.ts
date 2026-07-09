import type {Pagination as PaginationController} from '@coveo/headless/ssr-commerce';
import {getElement} from '../common/utils.js';

type PaginationState = PaginationController['state'];

// Maximum number of page buttons to show at once (a sliding window centered on
// the current page), so a large result set doesn't render hundreds of buttons.
const MAX_PAGE_BUTTONS = 5;

function hasPages(state: PaginationState): boolean {
  return state.totalPages > 1;
}

/** The page controls. Assumes more than one page. */
function renderPageControls(state: PaginationState): string {
  const {page, totalPages} = state;

  const half = Math.floor(MAX_PAGE_BUTTONS / 2);
  const end = Math.min(totalPages, Math.max(page + half + 1, MAX_PAGE_BUTTONS));
  const start = Math.max(0, end - MAX_PAGE_BUTTONS);
  const pages = Array.from({length: end - start}, (_, i) => start + i);

  return `
    <div>Page ${page + 1} of ${totalPages}</div>
    <button type="button" class="PreviousPage" aria-label="Previous page"${page === 0 ? ' disabled' : ''}>&lt;</button>
    ${pages
      .map(
        (p) =>
          `<button type="button" class="SelectPage" data-page="${p}" aria-label="Page ${p + 1}"${p === page ? ' aria-current="true"' : ''}>${p + 1}</button>`
      )
      .join('')}
    <button type="button" class="NextPage" aria-label="Next page"${page === totalPages - 1 ? ' disabled' : ''}>&gt;</button>
  `;
}

export function renderPagination(state: PaginationState): string {
  const visible = hasPages(state);
  return `<nav id="pagination" class="Pagination" aria-label="Pagination" style="display: ${
    visible ? 'flex' : 'none'
  };">${visible ? renderPageControls(state) : ''}</nav>`;
}

export function hydratePagination(pagination: PaginationController) {
  const container = getElement<HTMLElement>('pagination');
  if (!container) return;

  const update = () => {
    const visible = hasPages(pagination.state);
    container.style.display = visible ? 'flex' : 'none';
    container.innerHTML = visible ? renderPageControls(pagination.state) : '';
  };

  pagination.subscribe(update);
  update();

  // Event delegation keeps the click handler stable across re-renders.
  container.addEventListener('click', (event) => {
    const button = (event.target as HTMLElement).closest('button');
    if (!button) return;

    if (button.classList.contains('PreviousPage')) {
      pagination.previousPage();
    } else if (button.classList.contains('NextPage')) {
      pagination.nextPage();
    } else if (button.classList.contains('SelectPage')) {
      const page = Number(button.dataset.page);
      if (!Number.isNaN(page)) {
        pagination.selectPage(page);
      }
    }
  });
}

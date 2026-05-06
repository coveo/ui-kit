import {
  buildSearchEngine,
  buildSearchBox,
  buildResultList,
  buildPager,
  buildQuerySummary,
  buildFacet,
  buildSort,
  buildRelevanceSortCriterion,
  buildDateSortCriterion,
  SortOrder,
  type SearchEngine,
  type Result,
} from '@coveo/headless';

const engine: SearchEngine = buildSearchEngine({
  configuration: {
    accessToken: 'xx564559b1-0045-48e1-953c-3addd1ee4457',
    organizationId: 'searchuisamples',
  },
});

// Search Box
const searchBox = buildSearchBox(engine);
const searchBoxEl = document.getElementById('search-box')!;

function renderSearchBox() {
  searchBoxEl.innerHTML = '';
  const input = document.createElement('input');
  input.type = 'text';
  input.placeholder = 'Search...';
  input.value = searchBox.state.value;
  input.addEventListener('input', (e) => {
    searchBox.updateText((e.target as HTMLInputElement).value);
  });
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      searchBox.submit();
    }
  });
  searchBoxEl.appendChild(input);
}

searchBox.subscribe(renderSearchBox);
renderSearchBox();

// Query Summary
const querySummary = buildQuerySummary(engine);
const querySummaryEl = document.getElementById('query-summary')!;

function renderQuerySummary() {
  const state = querySummary.state;
  if (!state.hasResults) {
    querySummaryEl.textContent = state.hasError ? '' : 'No results';
    return;
  }
  querySummaryEl.textContent = `Results ${state.firstResult}-${state.lastResult} of ${state.total}${state.hasQuery ? ` for "${state.query}"` : ''}`;
}

querySummary.subscribe(renderQuerySummary);
renderQuerySummary();

// Sort
const relevance = buildRelevanceSortCriterion();
const dateDescending = buildDateSortCriterion(SortOrder.Descending);
const dateAscending = buildDateSortCriterion(SortOrder.Ascending);

const criteria = [
  {label: 'Relevance', criterion: relevance},
  {label: 'Date (newest)', criterion: dateDescending},
  {label: 'Date (oldest)', criterion: dateAscending},
];

const sort = buildSort(engine, {initialState: {criterion: relevance}});
const sortEl = document.getElementById('sort')!;

function renderSort() {
  sortEl.innerHTML = '';
  const select = document.createElement('select');
  criteria.forEach(({label, criterion}, i) => {
    const option = document.createElement('option');
    option.value = String(i);
    option.textContent = label;
    option.selected = sort.isSortedBy(criterion);
    select.appendChild(option);
  });
  select.addEventListener('change', (e) => {
    const idx = Number((e.target as HTMLSelectElement).value);
    sort.sortBy(criteria[idx].criterion);
  });
  sortEl.appendChild(select);
}

sort.subscribe(renderSort);
renderSort();

// Facets
const objectTypeFacet = buildFacet(engine, {options: {field: 'objecttype', facetId: 'objecttype'}});
const authorFacet = buildFacet(engine, {options: {field: 'author', facetId: 'author'}});

const facetsEl = document.getElementById('facets')!;

function renderFacet(facet: ReturnType<typeof buildFacet>, label: string): HTMLElement {
  const container = document.createElement('div');
  container.className = 'facet';
  const h3 = document.createElement('h3');
  h3.textContent = label;
  container.appendChild(h3);

  const state = facet.state;
  state.values.forEach((value) => {
    const div = document.createElement('div');
    div.className = 'facet-value';
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = value.state === 'selected';
    checkbox.addEventListener('change', () => facet.toggleSelect(value));
    const text = document.createElement('span');
    text.textContent = `${value.value} (${value.numberOfResults})`;
    div.appendChild(checkbox);
    div.appendChild(text);
    container.appendChild(div);
  });

  return container;
}

function renderFacets() {
  facetsEl.innerHTML = '';
  facetsEl.appendChild(renderFacet(objectTypeFacet, 'Type'));
  facetsEl.appendChild(renderFacet(authorFacet, 'Author'));
}

objectTypeFacet.subscribe(renderFacets);
authorFacet.subscribe(renderFacets);

// Result List
const resultList = buildResultList(engine);
const resultListEl = document.getElementById('result-list')!;

function renderResult(result: Result): HTMLElement {
  const item = document.createElement('div');
  item.className = 'result-item';
  item.innerHTML = `
    <h3><a href="${result.clickUri}" target="_blank">${result.title}</a></h3>
    <p>${result.excerpt || ''}</p>
  `;
  return item;
}

function renderResultList() {
  resultListEl.innerHTML = '';
  resultList.state.results.forEach((result) => {
    resultListEl.appendChild(renderResult(result));
  });
}

resultList.subscribe(renderResultList);

// Pager
const pager = buildPager(engine);
const pagerEl = document.getElementById('pager')!;

function renderPager() {
  pagerEl.innerHTML = '';
  const state = pager.state;

  if (state.hasPreviousPage) {
    const prev = document.createElement('button');
    prev.textContent = '← Previous';
    prev.addEventListener('click', () => pager.previousPage());
    pagerEl.appendChild(prev);
  }

  state.currentPages.forEach((pageNum) => {
    const btn = document.createElement('button');
    btn.textContent = String(pageNum);
    btn.className = pageNum === state.currentPage ? 'active' : '';
    btn.addEventListener('click', () => pager.selectPage(pageNum));
    pagerEl.appendChild(btn);
  });

  if (state.hasNextPage) {
    const next = document.createElement('button');
    next.textContent = 'Next →';
    next.addEventListener('click', () => pager.nextPage());
    pagerEl.appendChild(next);
  }
}

pager.subscribe(renderPager);

// Execute first search
engine.executeFirstSearch();

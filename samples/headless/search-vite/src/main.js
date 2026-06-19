import './style.css';
import {
  buildSearchEngine,
  getSampleSearchEngineConfiguration,
  buildSearchBox,
  buildResultList,
  buildFacet,
  buildSort,
  buildPager,
  buildQuerySummary,
  buildCriterionExpression,
  buildRelevanceSortCriterion,
  buildDateSortCriterion,
  SortOrder,
} from '@coveo/headless';

const engine = buildSearchEngine({
  configuration: getSampleSearchEngineConfiguration(),
});

// Search Box
const searchBox = buildSearchBox(engine);
const searchBoxEl = document.getElementById('search-box');

function renderSearchBox() {
  const {value, suggestions} = searchBox.state;
  searchBoxEl.innerHTML = `
    <input type="search" value="${value}" placeholder="Search..." />
    <ul>${suggestions.map((s) => `<li>${s.rawValue}</li>`).join('')}</ul>
  `;
  const input = searchBoxEl.querySelector('input');
  input.addEventListener('input', (e) => {
    searchBox.updateText(e.target.value);
  });
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') searchBox.submit();
  });
  searchBoxEl.querySelectorAll('li').forEach((li) => {
    li.addEventListener('click', () => {
      searchBox.selectSuggestion(li.textContent);
    });
  });
}

searchBox.subscribe(renderSearchBox);

// Query Summary
const querySummary = buildQuerySummary(engine);
const querySummaryEl = document.getElementById('query-summary');

function renderQuerySummary() {
  const {hasResults, first, last, total, query} = querySummary.state;
  querySummaryEl.textContent = hasResults
    ? `Results ${first}-${last} of ${total}${query ? ` for "${query}"` : ''}`
    : '';
}

querySummary.subscribe(renderQuerySummary);

// Sort
const relevance = buildRelevanceSortCriterion();
const dateDescending = buildDateSortCriterion(SortOrder.Descending);
const sortCriteria = [
  {label: 'Relevance', criterion: relevance},
  {label: 'Most Recent', criterion: dateDescending},
];

const sort = buildSort(engine, {
  initialState: {criterion: relevance},
});
const sortEl = document.getElementById('sort');

function renderSort() {
  const current = sort.state.sortCriteria;
  sortEl.innerHTML = `<label>Sort by:
    <select>
      ${sortCriteria.map((s) => `<option value="${buildCriterionExpression(s.criterion)}" ${buildCriterionExpression(s.criterion) === current ? 'selected' : ''}>${s.label}</option>`).join('')}
    </select>
  </label>`;
  sortEl.querySelector('select').addEventListener('change', (e) => {
    const selected = sortCriteria.find(
      (s) => buildCriterionExpression(s.criterion) === e.target.value
    );
    if (selected) sort.sortBy(selected.criterion);
  });
}

sort.subscribe(renderSort);

// Facets
const facetsEl = document.getElementById('facets');

function createFacet(field, title) {
  const facet = buildFacet(engine, {options: {field}});
  const container = document.createElement('div');
  container.className = 'facet';
  facetsEl.appendChild(container);

  function render() {
    const {values} = facet.state;
    container.innerHTML = `
      <h3>${title}</h3>
      <ul>${values.map((v) => `<li class="${v.state === 'selected' ? 'selected' : ''}" data-value="${v.value}">${v.value} (${v.numberOfResults})</li>`).join('')}</ul>
    `;
    container.querySelectorAll('li').forEach((li) => {
      li.addEventListener('click', () => {
        facet.toggleSelect(values.find((v) => v.value === li.dataset.value));
      });
    });
  }

  facet.subscribe(render);
}

createFacet('author', 'Author');
createFacet('filetype', 'File Type');

// Result List
const resultList = buildResultList(engine);
const resultListEl = document.getElementById('result-list');

function renderResultList() {
  const {results} = resultList.state;
  resultListEl.innerHTML = results
    .map(
      (r) => `
    <div class="result-item">
      <a href="${r.clickUri}" target="_blank">${r.title}</a>
      <p>${r.excerpt}</p>
    </div>`
    )
    .join('');
}

resultList.subscribe(renderResultList);

// Pager
const pager = buildPager(engine);
const pagerEl = document.getElementById('pager');

function renderPager() {
  const {currentPages, currentPage} = pager.state;
  pagerEl.innerHTML = `
    ${pager.state.hasPreviousPage ? '<button data-action="prev">&laquo; Prev</button>' : ''}
    ${currentPages.map((p) => `<button data-page="${p}" ${p === currentPage ? 'disabled' : ''}>${p}</button>`).join('')}
    ${pager.state.hasNextPage ? '<button data-action="next">Next &raquo;</button>' : ''}
  `;
  pagerEl.querySelectorAll('button').forEach((btn) => {
    btn.addEventListener('click', () => {
      if (btn.dataset.action === 'prev') pager.previousPage();
      else if (btn.dataset.action === 'next') pager.nextPage();
      else pager.selectPage(Number(btn.dataset.page));
    });
  });
}

pager.subscribe(renderPager);

// Execute initial search
engine.executeFirstSearch();

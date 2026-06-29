import './style.css';
import {
  buildSearchEngine,
  buildSearchBox,
  buildResultList,
  buildFacet,
  buildCategoryFacet,
  buildDateFacet,
  buildDateRange,
  buildSort,
  buildPager,
  buildQuerySummary,
  buildBreadcrumbManager,
  buildCriterionExpression,
  buildRelevanceSortCriterion,
  buildDateSortCriterion,
  SortOrder,
} from '@coveo/headless';

const engine = buildSearchEngine({
  configuration: {
    organizationId: 'searchuisamples',
    accessToken: 'xx564559b1-0045-48e1-953c-3addd1ee4457',
    search: {
      searchHub: 'BarcaKnowledge',
    },
  },
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
  const {hasResults, firstResult, lastResult, total, query} =
    querySummary.state;
  querySummaryEl.textContent = hasResults
    ? `Results ${firstResult}-${lastResult} of ${total}${query ? ` for "${query}"` : ''}`
    : '';
}

querySummary.subscribe(renderQuerySummary);

// Breadcrumbs
const breadcrumbManager = buildBreadcrumbManager(engine);
const breadcrumbsEl = document.getElementById('breadcrumbs');

function renderBreadcrumbs() {
  const {facetBreadcrumbs} = breadcrumbManager.state;
  const crumbs = facetBreadcrumbs.flatMap((facet) =>
    facet.values.map(
      (v) =>
        `<button class="breadcrumb" data-field="${facet.field}" data-value="${v.value.value}">${facet.field}: ${v.value.value} &times;</button>`
    )
  );
  breadcrumbsEl.innerHTML = crumbs.length
    ? crumbs.join('') +
      '<button class="breadcrumb clear-all">Clear all</button>'
    : '';
  breadcrumbsEl.querySelectorAll('button[data-field]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const facet = facetBreadcrumbs.find((f) => f.field === btn.dataset.field);
      const val = facet?.values.find(
        (v) => v.value.value === btn.dataset.value
      );
      val?.deselect();
    });
  });
  breadcrumbsEl.querySelector('.clear-all')?.addEventListener('click', () => {
    breadcrumbManager.deselectAll();
  });
}

breadcrumbManager.subscribe(renderBreadcrumbs);

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
    if (values.length === 0) {
      container.innerHTML = '';
      return;
    }
    container.innerHTML = `
      <h3>${title}</h3>
      <ul>${values.map((v) => `<li data-value="${v.value}"><label><input type="checkbox" ${v.state === 'selected' ? 'checked' : ''} /> ${v.value} (${v.numberOfResults})</label></li>`).join('')}</ul>
    `;
    container.querySelectorAll('li').forEach((li) => {
      li.addEventListener('click', (e) => {
        if (e.target.tagName !== 'INPUT') e.preventDefault();
        facet.toggleSelect(values.find((v) => v.value === li.dataset.value));
      });
    });
  }

  facet.subscribe(render);
}

function createCategoryFacet(field, title) {
  const facet = buildCategoryFacet(engine, {
    options: {field, delimitingCharacter: '|'},
  });
  const container = document.createElement('div');
  container.className = 'facet';
  facetsEl.appendChild(container);

  function render() {
    const {valuesAsTrees, selectedValueAncestry, hasActiveValues} = facet.state;
    const active = selectedValueAncestry[selectedValueAncestry.length - 1];
    const current = hasActiveValues ? (active?.children ?? []) : valuesAsTrees;
    if (!hasActiveValues && current.length === 0) {
      container.innerHTML = '';
      return;
    }
    const breadcrumb = hasActiveValues
      ? `<ol class="facet__breadcrumb"><li><button data-clear="1">All</button></li>${selectedValueAncestry.map((v, i) => `<li><button data-ancestor="${i}">${v.value}</button></li>`).join('')}</ol>`
      : '';
    container.innerHTML = `<h3>${title}</h3>${breadcrumb}<ul>${current
      .map(
        (v, i) =>
          `<li><button class="facet__link" data-idx="${i}">${v.value} <span class="facet__count">${v.numberOfResults}</span></button></li>`
      )
      .join('')}</ul>`;
    container
      .querySelector('[data-clear]')
      ?.addEventListener('click', () => facet.deselectAll());
    container.querySelectorAll('[data-ancestor]').forEach((btn) => {
      btn.addEventListener('click', () =>
        facet.toggleSelect(selectedValueAncestry[Number(btn.dataset.ancestor)])
      );
    });
    container.querySelectorAll('[data-idx]').forEach((btn) => {
      btn.addEventListener('click', () =>
        facet.toggleSelect(current[Number(btn.dataset.idx)])
      );
    });
  }

  facet.subscribe(render);
}

const dateUnitLabels = {
  week: 'Past week',
  month: 'Past month',
  quarter: 'Past quarter',
  year: 'Past year',
};

function createDateFacet(field, title) {
  const facet = buildDateFacet(engine, {
    options: {
      field,
      generateAutomaticRanges: false,
      currentValues: [
        buildDateRange({
          start: {period: 'past', unit: 'week', amount: 1},
          end: {period: 'now'},
        }),
        buildDateRange({
          start: {period: 'past', unit: 'month', amount: 1},
          end: {period: 'now'},
        }),
        buildDateRange({
          start: {period: 'past', unit: 'quarter', amount: 1},
          end: {period: 'now'},
        }),
        buildDateRange({
          start: {period: 'past', unit: 'year', amount: 1},
          end: {period: 'now'},
        }),
      ],
    },
  });
  const container = document.createElement('div');
  container.className = 'facet';
  facetsEl.appendChild(container);

  function render() {
    const visible = facet.state.values.filter(
      (v) => v.numberOfResults > 0 || v.state === 'selected'
    );
    if (visible.length === 0) {
      container.innerHTML = '';
      return;
    }
    container.innerHTML = `<h3>${title}</h3><ul>${visible
      .map((v) => {
        const label = dateUnitLabels[v.start.split('-')[2]] ?? v.start;
        return `<li data-start="${v.start}"><label><input type="checkbox" ${v.state === 'selected' ? 'checked' : ''} /> ${label} (${v.numberOfResults})</label></li>`;
      })
      .join('')}</ul>`;
    container.querySelectorAll('li').forEach((li) => {
      li.addEventListener('click', (e) => {
        if (e.target.tagName !== 'INPUT') e.preventDefault();
        const v = facet.state.values.find((x) => x.start === li.dataset.start);
        if (v) facet.toggleSelect(v);
      });
    });
  }

  facet.subscribe(render);
}

createCategoryFacet('ec_category', 'Category');
createFacet('article_type', 'Article type');
createFacet('robot_series', 'Robot series');
createFacet('difficulty_level', 'Difficulty');
createDateFacet('date', 'Date');
createFacet('author', 'Author');

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

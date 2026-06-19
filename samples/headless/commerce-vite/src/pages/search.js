import {
  buildSearch,
  buildSearchBox,
  buildContext,
} from '@coveo/headless/commerce';
import {engine} from '../engine.js';

export function renderSearch(container) {
  container.innerHTML = `
    <h1>Search</h1>
    <div id="search-box"></div>
    <div id="search-layout">
      <aside id="facets"></aside>
      <main>
        <div id="sort"></div>
        <div id="products"></div>
        <div id="pagination"></div>
      </main>
    </div>`;

  const context = buildContext(engine);
  context.setView({url: 'https://sports.barca.group/search'});

  const search = buildSearch(engine);
  const searchBox = buildSearchBox(engine);

  const searchBoxEl = document.getElementById('search-box');
  searchBox.subscribe(() => {
    const {value, suggestions} = searchBox.state;
    searchBoxEl.innerHTML = `
      <input id="search-input" type="text" value="${value}" placeholder="Search..." />
      <button id="search-btn">Search</button>
      ${suggestions.length ? `<ul class="suggestions">${suggestions.map((s) => `<li>${s.rawValue}</li>`).join('')}</ul>` : ''}
    `;
    document.getElementById('search-input').addEventListener('input', (e) => {
      searchBox.updateText(e.target.value);
    });
    document.getElementById('search-input').addEventListener('keydown', (e) => {
      if (e.key === 'Enter') searchBox.submit();
    });
    document.getElementById('search-btn').addEventListener('click', () => {
      searchBox.submit();
    });
    searchBoxEl.querySelectorAll('li').forEach((li) => {
      li.addEventListener('click', () => {
        searchBox.updateText(li.textContent);
        searchBox.submit();
      });
    });
  });

  search.subscribe(() => {
    const state = search.state;
    renderProducts(state.products);
    renderFacets(state.facets, search);
    renderSort(state.sort, search);
    renderPagination(state.pagination, search);
  });

  search.executeFirstSearch();
}

function renderProducts(products) {
  const el = document.getElementById('products');
  if (!el) return;
  el.innerHTML = products
    .map(
      (p) =>
        `<div class="product"><p>${p.ec_name || p.permanentid}</p><p>${p.ec_price ? '$' + p.ec_price : ''}</p></div>`
    )
    .join('');
}

function renderFacets(facets, search) {
  const el = document.getElementById('facets');
  if (!el || !facets) return;
  el.innerHTML = facets
    .map(
      (f) =>
        `<div class="facet"><h3>${f.displayName || f.facetId}</h3>${f.values
          .slice(0, 5)
          .map(
            (v) =>
              `<label><input type="checkbox" ${v.state === 'selected' ? 'checked' : ''} data-facet="${f.facetId}" data-value="${v.value}" /> ${v.value} (${v.numberOfResults})</label>`
          )
          .join('')}</div>`
    )
    .join('');

  el.querySelectorAll('input[type="checkbox"]').forEach((cb) => {
    cb.addEventListener('change', () => {
      search.toggleSelectFacetValue({
        facetId: cb.dataset.facet,
        selection: {value: cb.dataset.value},
      });
    });
  });
}

function renderSort(sort, search) {
  const el = document.getElementById('sort');
  if (!el || !sort) return;
  const options = sort.availableSorts || [];
  if (!options.length) return;
  el.innerHTML = `<label>Sort: <select id="sort-select">${options.map((s, i) => `<option value="${i}" ${sort.appliedSort === s ? 'selected' : ''}>${s.by === 'relevance' ? 'Relevance' : s.by}</option>`).join('')}</select></label>`;
  document.getElementById('sort-select').addEventListener('change', (e) => {
    search.sort(options[Number(e.target.value)]);
  });
}

function renderPagination(pagination, search) {
  const el = document.getElementById('pagination');
  if (!el || !pagination) return;
  const {page, totalPages} = pagination;
  el.innerHTML = `<button id="prev-page" ${page === 0 ? 'disabled' : ''}>Prev</button> Page ${page + 1} of ${totalPages} <button id="next-page" ${page >= totalPages - 1 ? 'disabled' : ''}>Next</button>`;
  document
    .getElementById('prev-page')
    .addEventListener('click', () => search.previousPage());
  document
    .getElementById('next-page')
    .addEventListener('click', () => search.nextPage());
}

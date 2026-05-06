import {buildSearch, buildSearchBox} from '@coveo/headless/commerce';
import {createSearchEngine} from './engine.js';
import {
  renderFacets,
  renderPager,
  renderProductList,
  renderSort,
  renderSummary,
} from './render-utils.js';

const engine = createSearchEngine();
const search = buildSearch(engine);
const searchBox = buildSearchBox(engine);
const summary = search.summary();
const pager = search.pagination({options: {pageSize: 9}});
const facetGenerator = search.facetGenerator();
const sort = search.sort();

const searchBoxEl = document.getElementById('search-box')!;
const querySummaryEl = document.getElementById('query-summary')!;
const sortEl = document.getElementById('sort')!;
const facetsEl = document.getElementById('facets')!;
const productListEl = document.getElementById('product-list')!;
const pagerEl = document.getElementById('pager')!;

function renderSearchBox() {
  searchBoxEl.innerHTML = '';
  const input = document.createElement('input');
  input.type = 'search';
  input.placeholder = 'Search products...';
  input.value = searchBox.state.value;
  input.addEventListener('input', (event) => {
    searchBox.updateText((event.target as HTMLInputElement).value);
  });
  input.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
      searchBox.submit();
    }
  });
  searchBoxEl.appendChild(input);
}

function renderSearchPage() {
  renderSummary(querySummaryEl, summary);
  renderSort(sortEl, sort);
  renderFacets(facetsEl, facetGenerator);
  renderProductList(productListEl, search.state.products);
  renderPager(pagerEl, pager);
}

searchBox.subscribe(renderSearchBox);
search.subscribe(renderSearchPage);
summary.subscribe(renderSearchPage);
sort.subscribe(renderSearchPage);
facetGenerator.subscribe(renderSearchPage);
pager.subscribe(renderSearchPage);

renderSearchBox();
renderSearchPage();
search.executeFirstSearch();

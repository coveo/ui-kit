import {buildProductListing} from '@coveo/headless/commerce';
import {createListingEngine} from './engine.js';
import {
  renderFacets,
  renderPager,
  renderProductList,
  renderSort,
  renderSummary,
} from './render-utils.js';

const engine = createListingEngine();
const listing = buildProductListing(engine);
const summary = listing.summary();
const pager = listing.pagination({options: {pageSize: 9}});
const facetGenerator = listing.facetGenerator();
const sort = listing.sort();

const querySummaryEl = document.getElementById('query-summary')!;
const sortEl = document.getElementById('sort')!;
const facetsEl = document.getElementById('facets')!;
const productListEl = document.getElementById('product-list')!;
const pagerEl = document.getElementById('pager')!;

function renderListingPage() {
  renderSummary(querySummaryEl, summary);
  renderSort(sortEl, sort);
  renderFacets(facetsEl, facetGenerator);
  renderProductList(productListEl, listing.state.products);
  renderPager(pagerEl, pager);
}

listing.subscribe(renderListingPage);
summary.subscribe(renderListingPage);
sort.subscribe(renderListingPage);
facetGenerator.subscribe(renderListingPage);
pager.subscribe(renderListingPage);

renderListingPage();
listing.executeFirstRequest();

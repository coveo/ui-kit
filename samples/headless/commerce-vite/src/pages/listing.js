import {buildProductListing, buildContext} from '@coveo/headless/commerce';
import {engine} from '../engine.js';

export function renderListing(container) {
  container.innerHTML = `
    <h1>Surf Accessories</h1>
    <div id="listing-layout">
      <aside id="listing-facets"></aside>
      <main>
        <div id="listing-products"></div>
        <div id="listing-pagination"></div>
      </main>
    </div>`;

  const context = buildContext(engine);
  context.setView({
    url: 'https://sports.barca.group/browse/promotions/surf-accessories',
  });

  const listing = buildProductListing(engine);

  listing.subscribe(() => {
    const state = listing.state;
    renderProducts(state.products);
    renderFacets(state.facets, listing);
    renderPagination(state.pagination, listing);
  });

  listing.refresh();
}

function renderProducts(products) {
  const el = document.getElementById('listing-products');
  if (!el) return;
  el.innerHTML = products
    .map(
      (p) =>
        `<div class="product"><p>${p.ec_name || p.permanentid}</p><p>${p.ec_price ? '$' + p.ec_price : ''}</p></div>`
    )
    .join('');
}

function renderFacets(facets, listing) {
  const el = document.getElementById('listing-facets');
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
      listing.toggleSelectFacetValue({
        facetId: cb.dataset.facet,
        selection: {value: cb.dataset.value},
      });
    });
  });
}

function renderPagination(pagination, listing) {
  const el = document.getElementById('listing-pagination');
  if (!el || !pagination) return;
  const {page, totalPages} = pagination;
  el.innerHTML = `<button id="listing-prev" ${page === 0 ? 'disabled' : ''}>Prev</button> Page ${page + 1} of ${totalPages} <button id="listing-next" ${page >= totalPages - 1 ? 'disabled' : ''}>Next</button>`;
  document
    .getElementById('listing-prev')
    .addEventListener('click', () => listing.previousPage());
  document
    .getElementById('listing-next')
    .addEventListener('click', () => listing.nextPage());
}

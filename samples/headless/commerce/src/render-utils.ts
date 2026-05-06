import {
  SortBy,
  type CategoryFacet,
  type DateFacet,
  type FacetGenerator,
  type NumericFacet,
  type Pagination,
  type Product,
  type RegularFacet,
  type SearchSummaryState,
  type Sort,
  type SortCriterion,
  type Summary,
} from '@coveo/headless/commerce';

function escapeHtml(value: string) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

export function renderProduct(product: Product): HTMLElement {
  const item = document.createElement('div');
  item.className = 'product-item';

  const thumbnail = product.ec_thumbnails[0] || '';
  const price =
    product.ec_price != null ? `$${Number(product.ec_price).toFixed(2)}` : '';
  const brand = product.ec_brand || '';
  const category = product.ec_category.at(-1)?.split('|').at(-1) || '';
  const title = escapeHtml(product.ec_name || product.permanentid);

  item.innerHTML = `
    ${thumbnail ? `<img src="${escapeHtml(thumbnail)}" alt="${title}" />` : '<div></div>'}
    <div class="product-info">
      <h3><a href="${escapeHtml(product.clickUri)}" target="_blank" rel="noreferrer">${title}</a></h3>
      ${brand ? `<div class="brand">${escapeHtml(brand)}</div>` : ''}
      ${category ? `<div class="category">${escapeHtml(category)}</div>` : ''}
      ${price ? `<div class="price">${price}</div>` : ''}
    </div>
  `;
  return item;
}

export function renderProductList(
  productListEl: HTMLElement,
  products: Product[],
  emptyText = 'No products found'
) {
  productListEl.innerHTML = '';

  if (products.length === 0) {
    const empty = document.createElement('div');
    empty.className = 'empty-state';
    empty.textContent = emptyText;
    productListEl.appendChild(empty);
    return;
  }

  products.forEach((product) => {
    productListEl.appendChild(renderProduct(product));
  });
}

function getSortLabel(criterion: SortCriterion) {
  switch (criterion.by) {
    case SortBy.Relevance:
      return 'Relevance';
    case SortBy.Fields:
      return criterion.fields.map((field) => field.displayName).join(', ');
  }
}

export function renderSort(sortEl: HTMLElement, sort: Sort) {
  sortEl.innerHTML = '';
  const {availableSorts, appliedSort} = sort.state;

  if (!availableSorts.length) {
    return;
  }

  const label = document.createElement('label');
  label.textContent = 'Sort by: ';
  label.htmlFor = 'sort-select';

  const select = document.createElement('select');
  select.id = 'sort-select';
  select.value = JSON.stringify(appliedSort);

  availableSorts.forEach((sortOption) => {
    const option = document.createElement('option');
    option.value = JSON.stringify(sortOption);
    option.textContent = getSortLabel(sortOption);
    select.appendChild(option);
  });

  select.addEventListener('change', (event) => {
    sort.sortBy(JSON.parse((event.target as HTMLSelectElement).value));
  });

  sortEl.append(label, select);
}

function appendFacetActions(
  container: HTMLElement,
  canShowLessValues: boolean,
  canShowMoreValues: boolean,
  showLessValues: () => void,
  showMoreValues: () => void,
  deselectAll?: () => void,
  hasActiveValues?: boolean
) {
  const actions = document.createElement('div');
  actions.className = 'facet-actions';

  if (deselectAll && hasActiveValues) {
    const clear = document.createElement('button');
    clear.type = 'button';
    clear.textContent = 'Clear';
    clear.addEventListener('click', () => deselectAll());
    actions.appendChild(clear);
  }

  if (canShowLessValues) {
    const less = document.createElement('button');
    less.type = 'button';
    less.textContent = 'Show less';
    less.addEventListener('click', () => showLessValues());
    actions.appendChild(less);
  }

  if (canShowMoreValues) {
    const more = document.createElement('button');
    more.type = 'button';
    more.textContent = 'Show more';
    more.addEventListener('click', () => showMoreValues());
    actions.appendChild(more);
  }

  if (actions.children.length) {
    container.appendChild(actions);
  }
}

function renderRegularFacet(container: HTMLElement, facet: RegularFacet) {
  facet.state.values.forEach((value) => {
    const label = document.createElement('label');
    label.className = 'facet-value';

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = value.state !== 'idle';
    checkbox.addEventListener('change', () => facet.toggleSelect(value));

    const text = document.createElement('span');
    text.textContent = `${value.value} (${value.numberOfResults})`;

    label.append(checkbox, text);
    container.appendChild(label);
  });

  appendFacetActions(
    container,
    facet.state.canShowLessValues,
    facet.state.canShowMoreValues,
    facet.showLessValues,
    facet.showMoreValues,
    facet.deselectAll,
    facet.state.hasActiveValues
  );
}

function renderNumericFacet(container: HTMLElement, facet: NumericFacet) {
  facet.state.values.forEach((value) => {
    const label = document.createElement('label');
    label.className = 'facet-value';

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = value.state !== 'idle';
    checkbox.addEventListener('change', () => facet.toggleSelect(value));

    const text = document.createElement('span');
    text.textContent = `${value.start} - ${value.end} (${value.numberOfResults})`;

    label.append(checkbox, text);
    container.appendChild(label);
  });

  appendFacetActions(
    container,
    facet.state.canShowLessValues,
    facet.state.canShowMoreValues,
    facet.showLessValues,
    facet.showMoreValues,
    facet.deselectAll,
    facet.state.hasActiveValues
  );
}

function renderDateFacet(container: HTMLElement, facet: DateFacet) {
  facet.state.values.forEach((value) => {
    const label = document.createElement('label');
    label.className = 'facet-value';

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = value.state !== 'idle';
    checkbox.addEventListener('change', () => facet.toggleSelect(value));

    const text = document.createElement('span');
    text.textContent = `${value.start} - ${value.end} (${value.numberOfResults})`;

    label.append(checkbox, text);
    container.appendChild(label);
  });

  appendFacetActions(
    container,
    facet.state.canShowLessValues,
    facet.state.canShowMoreValues,
    facet.showLessValues,
    facet.showMoreValues,
    facet.deselectAll,
    facet.state.hasActiveValues
  );
}

function renderCategoryFacet(container: HTMLElement, facet: CategoryFacet) {
  const values = facet.state.hasActiveValues
    ? [
        ...(facet.state.selectedValueAncestry ?? []),
        ...(facet.state.selectedValueAncestry?.at(-1)?.children ?? []).filter(
          (value) => !facet.isValueSelected(value)
        ),
      ]
    : facet.state.values;

  values.forEach((value) => {
    const label = document.createElement('label');
    label.className = 'facet-value';

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = facet.isValueSelected(value);
    checkbox.addEventListener('change', () => {
      if (facet.isValueSelected(value)) {
        facet.deselectAll();
        return;
      }
      facet.toggleSelect(value);
    });

    const text = document.createElement('span');
    text.textContent = `${value.value} (${value.numberOfResults})`;

    label.append(checkbox, text);
    container.appendChild(label);
  });

  appendFacetActions(
    container,
    facet.state.canShowLessValues,
    facet.state.canShowMoreValues,
    facet.showLessValues,
    facet.showMoreValues,
    facet.deselectAll,
    facet.state.hasActiveValues
  );
}

export function renderFacets(
  facetsEl: HTMLElement,
  facetGenerator: FacetGenerator
) {
  facetsEl.innerHTML = '';

  facetGenerator.facets.forEach((facet) => {
    const container = document.createElement('section');
    container.className = 'facet';

    const title = document.createElement('h3');
    title.textContent = facet.state.displayName || facet.state.facetId;
    container.appendChild(title);

    const values = document.createElement('div');
    values.className = 'facet-values';
    container.appendChild(values);

    switch (facet.type) {
      case 'regular':
        renderRegularFacet(values, facet);
        break;
      case 'numericalRange':
        renderNumericFacet(values, facet);
        break;
      case 'dateRange':
        renderDateFacet(values, facet);
        break;
      case 'hierarchical':
        renderCategoryFacet(values, facet);
        break;
      default:
        return;
    }

    facetsEl.appendChild(container);
  });
}

export function renderSummary(
  querySummaryEl: HTMLElement,
  summary: Summary,
  emptyText = 'No products found'
) {
  const state = summary.state as SearchSummaryState | Summary['state'];

  if (state.isLoading && !state.firstRequestExecuted) {
    querySummaryEl.textContent = 'Loading products...';
    return;
  }

  if (!state.hasProducts) {
    querySummaryEl.textContent = emptyText;
    return;
  }

  querySummaryEl.textContent = `Products ${state.firstProduct}-${state.lastProduct} of ${state.totalNumberOfProducts}${'query' in state && state.query ? ` for "${state.query}"` : ''}`;
}

export function renderPager(pagerEl: HTMLElement, pager: Pagination) {
  pagerEl.innerHTML = '';

  if (pager.state.totalPages <= 1) {
    return;
  }

  const {page, totalPages} = pager.state;

  const previous = document.createElement('button');
  previous.textContent = '← Previous';
  previous.disabled = page === 0;
  previous.addEventListener('click', () => pager.previousPage());
  pagerEl.appendChild(previous);

  const minDisplayed = Math.max(0, page - 2);
  const maxDisplayed = Math.min(totalPages - 1, page + 2);
  for (let i = minDisplayed; i <= maxDisplayed; i++) {
    const button = document.createElement('button');
    button.textContent = String(i + 1);
    button.className = i === page ? 'active' : '';
    button.addEventListener('click', () => pager.selectPage(i));
    pagerEl.appendChild(button);
  }

  const next = document.createElement('button');
  next.textContent = 'Next →';
  next.disabled = page >= totalPages - 1;
  next.addEventListener('click', () => pager.nextPage());
  pagerEl.appendChild(next);
}

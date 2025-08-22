import {engineDefinition} from './engine.js';
import {
  formatQuerySummary,
  getElement,
  getProductsFromController,
  getSearchValueFromController,
  getSummaryFromController,
  renderProductsList,
} from './shared.js';

async function initApp() {
  try {
    const staticState = (window as any).__STATIC_STATE__;
    console.log('🔄 Hydrating SSR state...', staticState);

    const {controllers} =
      await engineDefinition.searchEngineDefinition.hydrateStaticState(
        staticState
      );

    console.log('✅ Controllers:', Object.keys(controllers || {}));

    // Initialize components
    SearchBoxComponent(controllers.searchBox);
    ProductsComponent(controllers.productList);
    QuerySummaryComponent(controllers.summary, controllers.searchBox);

    console.log('✨ Commerce interface initialized');
  } catch (error) {
    console.error('❌ Initialization failed:', error);
    showError();
  }
}

function SearchBoxComponent(searchBox: any) {
  if (!searchBox) return;

  const input = getElement<HTMLInputElement>('search-input');
  const button = getElement<HTMLButtonElement>('search-button');
  if (!input || !button) return;

  // Initial value
  input.value = searchBox.state.value || '';

  const performSearch = () => {
    searchBox.updateText(input.value);
    searchBox.submit();
  };

  button.addEventListener('click', performSearch);
  input.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') performSearch();
  });

  searchBox.subscribe(() => {
    input.value = searchBox.state.value;
  });
}

function ProductsComponent(productList: any) {
  if (!productList) return;

  const grid = getElement<HTMLDivElement>('products-grid');
  const noProducts = getElement<HTMLDivElement>('no-products');
  if (!grid) return;

  const render = () => {
    const products = getProductsFromController(productList);

    // Hide placeholders
    if (noProducts) noProducts.style.display = 'none';
    grid.innerHTML = '';

    if (!products.length) {
      if (noProducts) noProducts.style.display = 'block';
      return;
    }

    grid.innerHTML = renderProductsList(products);
  };

  productList.subscribe(render);
  render();
}

function QuerySummaryComponent(summary: any, searchBox: any) {
  if (!summary || !searchBox) return;

  const container = getElement<HTMLDivElement>('query-summary');
  if (!container) return;

  const render = () => {
    const sum = getSummaryFromController(summary);
    const searchValue = getSearchValueFromController(searchBox);
    container.textContent = formatQuerySummary(sum, searchValue);
  };

  summary.subscribe(render);
  render();
}

function showError() {
  const err = getElement<HTMLDivElement>('query-error');
  if (err) err.style.display = 'block';
}

// ===== Boot =====
document.readyState === 'loading'
  ? document.addEventListener('DOMContentLoaded', initApp)
  : initApp();

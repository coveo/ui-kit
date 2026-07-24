import type {InstantProducts, Product, SearchBox} from '@coveo/headless/ssr-commerce';
import {escapeHtml, formatCurrency, getElement} from '../common/utils.js';

/**
 * Search box with query suggestions and instant products.
 *
 * The form is rendered on every page (submitting GETs to `/search`), but the
 * interactive dropdown is only hydrated on the search page, where the
 * `searchBox` and `instantProducts` controllers exist — listing pages fall
 * back to the native form submit.
 *
 * As the user types, `searchBox` fetches query suggestions (left column) and
 * `instantProducts` fetches a preview of the best-matching products (right
 * column). Arrow keys move through the suggestions, previewing instant products
 * for the highlighted one; Enter selects it (or submits the typed query when
 * none is highlighted); Escape (or a click outside) closes the dropdown.
 */

const SUGGESTIONS_LIST_ID = 'search-suggestions';
const suggestionOptionId = (index: number) => `search-suggestion-${index}`;

export function renderSearch(value: string): string {
  const hasValue = value !== '';
  return `
    <form class="SearchBox" method="GET" action="/search" role="search">
      <div class="SearchBoxField">
        <input
          type="search"
          id="search-input"
          class="SearchBoxInput"
          name="q"
          placeholder="Search for products..."
          value="${escapeHtml(value)}"
          role="combobox"
          aria-label="Search for products"
          aria-autocomplete="list"
          aria-expanded="false"
          aria-controls="${SUGGESTIONS_LIST_ID}"
          autocomplete="off"
        />
        <button
          type="button"
          id="search-clear"
          class="SearchBoxClear"
          aria-label="Clear search"
          ${hasValue ? '' : 'hidden'}
        >✕</button>
      </div>
      <button id="search-button" class="SearchBoxSubmit" type="submit">Search</button>
      <div id="search-dropdown" class="SearchBoxDropdown" hidden></div>
    </form>
  `;
}

/** The query-suggestions column. `highlightedValue` is trusted HTML from Headless. */
function renderSuggestions(
  suggestions: SearchBox['state']['suggestions'],
  activeIndex: number
): string {
  if (suggestions.length === 0) {
    return '';
  }

  const items = suggestions
    .map((suggestion, index) => {
      const isActive = index === activeIndex;
      return `
        <li role="presentation">
          <button
            type="button"
            id="${suggestionOptionId(index)}"
            class="Suggestion${isActive ? ' active' : ''}"
            role="option"
            aria-selected="${isActive}"
            data-suggestion-index="${index}"
          >${suggestion.highlightedValue}</button>
        </li>`;
    })
    .join('');

  return `
    <div class="SearchBoxDropdownMain">
      <h4>Query suggestions</h4>
      <ul class="Suggestions" id="${SUGGESTIONS_LIST_ID}" role="listbox">${items}</ul>
    </div>
  `;
}

/** A single instant-product preview tile. */
function renderInstantProduct(product: Product, index: number, currency: string): string {
  const name = product.ec_name ?? 'Unknown product';
  const imageUrl = product.ec_images?.[0] ?? '';
  const price = product.ec_promo_price ?? product.ec_price;
  const image = imageUrl
    ? `<img class="InstantProductImage" src="${escapeHtml(imageUrl)}" alt="${escapeHtml(name)}" loading="lazy" onerror="this.style.display='none'" />`
    : '<span class="InstantProductImage InstantProductImagePlaceholder" aria-hidden="true"></span>';

  return `
    <li class="InstantProduct">
      <button type="button" class="InstantProductLink" data-instant-product-index="${index}">
        ${image}
        <span class="InstantProductInfo">
          <span class="InstantProductName">${escapeHtml(name)}</span>
          ${
            typeof price === 'number'
              ? `<span class="InstantProductPrice">${formatCurrency(price, currency)}</span>`
              : ''
          }
        </span>
      </button>
    </li>
  `;
}

/** The instant-products column. */
function renderInstantProducts(products: Product[], currency: string): string {
  if (products.length === 0) {
    return '';
  }

  const items = products
    .map((product, index) => renderInstantProduct(product, index, currency))
    .join('');

  return `
    <div class="SearchBoxDropdownAside">
      <h4>Instant products</h4>
      <ul class="InstantProducts">${items}</ul>
    </div>
  `;
}

export function hydrateSearch(
  searchBox: SearchBox,
  instantProducts: InstantProducts,
  currency: string
) {
  const input = getElement<HTMLInputElement>('search-input');
  const dropdown = getElement<HTMLDivElement>('search-dropdown');
  const clearButton = getElement<HTMLButtonElement>('search-clear');
  const form = input?.form;
  if (!input || !dropdown || !form) return;

  let isOpen = false;
  // Index of the keyboard-highlighted suggestion, or -1 when none is active.
  let activeIndex = -1;

  const close = () => {
    isOpen = false;
    activeIndex = -1;
    render();
  };

  const open = () => {
    isOpen = true;
    render();
  };

  /** Preview a suggestion: highlight it and refresh instant products for it. */
  const highlight = (index: number) => {
    if (index === activeIndex) return;
    activeIndex = index;
    const suggestion = searchBox.state.suggestions[index];
    if (suggestion) {
      instantProducts.updateQuery(suggestion.rawValue);
    }
    render();
  };

  /** Re-renders the dropdown from the current controller state. */
  const render = () => {
    const {suggestions} = searchBox.state;
    const {products} = instantProducts.state;
    // Never show the dropdown for an empty box (e.g. after clearing), even if
    // the controllers still hold suggestions/products from a previous query.
    const hasQuery = searchBox.state.value.trim() !== '';
    const show = isOpen && hasQuery && (suggestions.length > 0 || products.length > 0);

    input.setAttribute('aria-expanded', String(show));
    dropdown.hidden = !show;

    if (!show) {
      dropdown.innerHTML = '';
      input.removeAttribute('aria-activedescendant');
      return;
    }

    dropdown.innerHTML = `
      <div class="SearchBoxDropdownColumns">
        ${renderSuggestions(suggestions, activeIndex)}
        ${renderInstantProducts(products, currency)}
      </div>
    `;

    if (activeIndex >= 0) {
      input.setAttribute('aria-activedescendant', suggestionOptionId(activeIndex));
    } else {
      input.removeAttribute('aria-activedescendant');
    }
  };

  const syncClearButton = () => {
    if (clearButton) {
      clearButton.hidden = input.value === '';
    }
  };

  // Keep the input value and dropdown in sync with the controllers (e.g. when a
  // suggestion is selected, or the box is cleared programmatically).
  const onStateChange = () => {
    input.value = searchBox.state.value;
    syncClearButton();
    render();
  };
  searchBox.subscribe(onStateChange);
  instantProducts.subscribe(render);

  // Typing updates both controllers and (re)opens the dropdown.
  input.addEventListener('input', () => {
    const value = input.value;
    searchBox.updateText(value);
    instantProducts.updateQuery(value);
    activeIndex = -1;
    syncClearButton();
    open();
  });

  input.addEventListener('focus', open);

  input.addEventListener('keydown', (event) => {
    const {suggestions} = searchBox.state;
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        if (!isOpen) {
          open();
        } else if (suggestions.length > 0) {
          highlight((activeIndex + 1) % suggestions.length);
        }
        break;

      case 'ArrowUp':
        event.preventDefault();
        if (suggestions.length > 0) {
          highlight(activeIndex <= 0 ? suggestions.length - 1 : activeIndex - 1);
        }
        break;

      case 'Enter': {
        const active = suggestions[activeIndex];
        if (active) {
          // Stop the native form submit so we select the suggestion instead.
          event.preventDefault();
          searchBox.selectSuggestion(active.rawValue);
          close();
        }
        // With no active suggestion, let the form's submit handler run.
        break;
      }

      case 'Escape':
        // Prevent the native "clear" behavior of <input type="search"> so
        // Escape only dismisses the dropdown (keeping the typed query).
        event.preventDefault();
        close();
        break;

      default:
        break;
    }
  });

  // Delegated handlers keep working across dropdown re-renders.
  dropdown.addEventListener('mouseover', (event) => {
    const option = (event.target as HTMLElement).closest<HTMLElement>('[data-suggestion-index]');
    if (option) {
      highlight(Number(option.dataset.suggestionIndex));
    }
  });

  dropdown.addEventListener('click', (event) => {
    const target = event.target as HTMLElement;

    const suggestion = target.closest<HTMLElement>('[data-suggestion-index]');
    if (suggestion) {
      const index = Number(suggestion.dataset.suggestionIndex);
      const selected = searchBox.state.suggestions[index];
      if (selected) {
        searchBox.selectSuggestion(selected.rawValue);
        close();
      }
      return;
    }

    const productTile = target.closest<HTMLElement>('[data-instant-product-index]');
    if (productTile) {
      const index = Number(productTile.dataset.instantProductIndex);
      const product = instantProducts.state.products[index];
      if (product) {
        // Log the product-click event, then open the product page.
        instantProducts.interactiveProduct({options: {product}}).select();
        if (product.clickUri) {
          window.open(product.clickUri, '_blank', 'noopener,noreferrer');
        }
      }
    }
  });

  clearButton?.addEventListener('click', () => {
    searchBox.clear();
    close();
    input.focus();
  });

  // Close when clicking/tapping outside the search box.
  document.addEventListener('pointerdown', (event) => {
    if (isOpen && !form.contains(event.target as Node)) {
      close();
    }
  });

  // Submitting (Search button, or Enter with no highlighted suggestion) runs
  // the query. The URL is kept in sync by the parameter manager (see
  // components/ParameterManager.ts).
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    searchBox.updateText(input.value.trim());
    searchBox.submit();
    close();
  });

  onStateChange();
}

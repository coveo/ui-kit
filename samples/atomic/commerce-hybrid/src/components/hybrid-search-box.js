import {
  buildFilterSuggestionsGenerator,
  buildInstantProducts,
  buildRecentQueriesList,
  buildSearch,
  buildSearchBox,
  buildStandaloneSearchBox,
} from '@coveo/headless/commerce';
import {createAnnouncer} from '../aria-live.js';

/**
 * A search box built directly with Headless commerce controllers, meant to stand
 * in for `atomic-commerce-search-box` inside an otherwise standard
 * `atomic-commerce-interface`.
 *
 * It exists to show what a *replacement* looks like, not to be a better search
 * box. The capability that justifies replacing the Atomic component here is the
 * dropdown layout: query suggestions, recent queries, category/brand filter
 * suggestions, and instant products, grouped and ordered the way this storefront
 * wants them. `atomic-commerce-search-box` composes its suggestion children in a
 * fixed one- or two-column layout and cannot express that, and it has no
 * equivalent for filter suggestions at all.
 *
 * Coupling to the rest of the interface is the engine and nothing else. This
 * element never looks at `atomic-commerce-interface`, and no Atomic component
 * looks at this element. Everything downstream (products, facets, pager, sort,
 * breadbox, query summary, URL hash, analytics) reacts because the controllers
 * below dispatch into the same engine those components read from.
 *
 * Set `redirection-url` to get standalone behaviour: instead of searching in
 * place, submitting stores the query and navigates to the search page.
 */
export class HybridSearchBox extends HTMLElement {
  #searchBox;
  #search;
  #instantProducts;
  #filterSuggestionsGenerator;
  #recentQueries;
  #unsubscribers = [];
  #filterSuggestionsUnsubscribers = new Map();
  #announce = () => {};
  #lastFilterSuggestionsKey = '';
  #lastInstantProductsQuery = '';

  /** Flattened list of keyboard-navigable entries currently in the listbox. */
  #options = [];
  #activeIndex = -1;
  #isExpanded = false;

  #input;
  #panel;
  #listbox;
  #productsPanel;

  get #redirectionUrl() {
    return this.getAttribute('redirection-url');
  }

  get #isStandalone() {
    return this.#redirectionUrl !== null;
  }

  connectedCallback() {
    this.#renderShell();
  }

  disconnectedCallback() {
    for (const unsubscribe of [
      ...this.#unsubscribers,
      ...this.#filterSuggestionsUnsubscribers.values(),
    ]) {
      unsubscribe();
    }
    this.#unsubscribers = [];
    this.#filterSuggestionsUnsubscribers.clear();
  }

  /**
   * Binds the box to a commerce engine.
   *
   * Call this only once `atomic-commerce-interface.initializeWithEngine()` has
   * resolved. The interface sets up its URL manager as the *last* step of
   * initialization, so a query submitted before that resolves runs the search but
   * never reaches the address bar.
   */
  initialize(engine) {
    // `id` is the binding key between the search box and everything scoped to it.
    // `buildInstantProducts` receives it as `searchBoxId` so both controllers read
    // the same query. Atomic does exactly this with its host element's DOM id.
    const searchBoxId = this.id || 'hybrid-search-box';

    const options = {
      id: searchBoxId,
      // The API-provided text is HTML-escaped by Headless before these delimiters
      // are inserted, so `highlightedValue` is safe to assign as HTML: the only
      // unescaped markup in it is the markup on this line.
      highlightOptions: {
        notMatchDelimiters: {open: '<strong>', close: '</strong>'},
        correctionDelimiters: {open: '<em>', close: '</em>'},
      },
      // Both default to the values the Atomic search box relies on. Diverging here
      // desynchronizes this box from the components reading the same engine:
      // `clearFilters: false` leaves stale refinements in the breadbox across
      // queries, and `enableResults: true` populates a response field that
      // `atomic-commerce-product-list` does not render.
      clearFilters: true,
      enableResults: false,
    };

    this.#searchBox = this.#isStandalone
      ? buildStandaloneSearchBox(engine, {
          options: {...options, redirectionUrl: this.#redirectionUrl, overwrite: true},
        })
      : buildSearchBox(engine, {options});

    this.#recentQueries = buildRecentQueriesList(engine, {options: {maxLength: 5}});

    // Instant products and filter suggestions only make sense when the box
    // searches in place.
    if (!this.#isStandalone) {
      this.#instantProducts = buildInstantProducts(engine, {options: {searchBoxId}});
      this.#filterSuggestionsGenerator = buildFilterSuggestionsGenerator(engine);
      // Only used to observe the current response id, which filter suggestions
      // depend on. See `#syncFilterSuggestions`.
      this.#search = buildSearch(engine);
    }

    this.#announce = createAnnouncer({
      'search-box': false,
      'search-suggestions': true,
    });

    for (const controller of [
      this.#searchBox,
      this.#recentQueries,
      this.#instantProducts,
      this.#filterSuggestionsGenerator,
    ]) {
      if (controller) {
        this.#unsubscribers.push(controller.subscribe(() => this.#onStateChange()));
      }
    }

    if (this.#isStandalone) {
      this.#unsubscribers.push(this.#searchBox.subscribe(() => this.#handleRedirection()));
    }

    this.#input.disabled = false;
    this.#input.value = this.#searchBox.state.value;
    this.#renderPanel();
  }

  // ---------------------------------------------------------------------------
  // Rendering
  // ---------------------------------------------------------------------------

  #renderShell() {
    const listboxId = `${this.id || 'hybrid-search-box'}-listbox`;

    this.classList.add('hsb');

    const form = document.createElement('form');
    form.className = 'hsb__form';
    form.setAttribute('role', 'search');
    form.addEventListener('submit', (event) => {
      event.preventDefault();
      this.#submit();
    });

    this.#input = document.createElement('input');
    this.#input.type = 'text';
    this.#input.className = 'hsb__input';
    this.#input.placeholder = this.getAttribute('placeholder') ?? 'Search';
    this.#input.setAttribute('aria-label', this.getAttribute('label') ?? 'Search products');
    this.#input.disabled = true;
    // ARIA 1.2 combobox: the input owns the popup relationship, the popup is a
    // listbox, and the active option is referenced rather than focused.
    this.#input.setAttribute('role', 'combobox');
    this.#input.setAttribute('aria-autocomplete', 'list');
    this.#input.setAttribute('aria-expanded', 'false');
    this.#input.setAttribute('aria-controls', listboxId);
    this.#input.autocomplete = 'off';
    this.#input.addEventListener('input', () => this.#onInput());
    this.#input.addEventListener('keydown', (event) => this.#onKeyDown(event));
    this.#input.addEventListener('focus', () => this.#onInput());

    const clearButton = document.createElement('button');
    clearButton.type = 'button';
    clearButton.className = 'hsb__clear';
    clearButton.textContent = 'Clear';
    clearButton.addEventListener('click', () => this.#clear());

    const submitButton = document.createElement('button');
    submitButton.type = 'submit';
    submitButton.className = 'hsb__submit';
    submitButton.textContent = 'Search';

    form.append(this.#input, clearButton, submitButton);

    this.#panel = document.createElement('div');
    this.#panel.className = 'hsb__panel';
    this.#panel.hidden = true;

    this.#listbox = document.createElement('div');
    this.#listbox.id = listboxId;
    this.#listbox.setAttribute('role', 'listbox');
    this.#listbox.setAttribute('aria-label', 'Search suggestions');
    this.#listbox.className = 'hsb__listbox';

    // Instant products sit outside the listbox on purpose. They are links, not
    // selectable options, so putting them in the same listbox would either lie
    // about their role or force the `role="application"` workaround that
    // `atomic-commerce-search-box` uses. Keeping them out means arrow keys stay
    // within the suggestion list and the products stay reachable with Tab.
    this.#productsPanel = document.createElement('div');
    this.#productsPanel.className = 'hsb__products';

    this.#panel.append(this.#listbox, this.#productsPanel);
    this.append(form, this.#panel);

    document.addEventListener('click', (event) => {
      if (!this.contains(event.target)) {
        this.#collapse();
      }
    });
  }

  #renderPanel() {
    if (!this.#searchBox) {
      return;
    }

    const groups = this.#collectGroups();
    this.#options = groups.flatMap((group) => group.options);

    if (this.#activeIndex >= this.#options.length) {
      this.#activeIndex = -1;
    }

    this.#syncInstantProducts();

    this.#listbox.replaceChildren(...groups.map((group) => this.#renderGroup(group)));
    this.#renderInstantProducts();

    const hasContent = this.#options.length > 0 || this.#productsPanel.childElementCount > 0;
    this.#panel.hidden = !(this.#isExpanded && hasContent);
    this.#input.setAttribute('aria-expanded', String(!this.#panel.hidden));

    this.#syncActiveDescendant();
    this.#announceSuggestions();
  }

  /**
   * Builds the ordered groups shown in the dropdown. This ordering is the reason
   * the Atomic search box was replaced: recent queries first while the box is
   * empty, then completions, then filter suggestions per facet.
   */
  #collectGroups() {
    const groups = [];
    const {value, suggestions} = this.#searchBox.state;

    if (!value) {
      const recent = this.#recentQueries.state.queries;
      if (recent.length > 0) {
        groups.push({
          label: 'Recent searches',
          options: recent.map((query, index) => ({
            label: query,
            query,
            onSelect: () => {
              this.#recentQueries.executeRecentQuery(index);
              this.#collapse();
            },
          })),
        });
      }
    }

    if (suggestions.length > 0) {
      groups.push({
        label: 'Suggestions',
        options: suggestions.map((suggestion) => ({
          label: suggestion.rawValue,
          query: suggestion.rawValue,
          html: suggestion.highlightedValue,
          onSelect: () => {
            this.#input.value = suggestion.rawValue;
            this.#searchBox.selectSuggestion(suggestion.rawValue);
            this.#collapse();
          },
        })),
      });
    }

    for (const filterSuggestions of this.#filterSuggestionsGenerator?.filterSuggestions ?? []) {
      const {displayName, values} = filterSuggestions.state;
      if (values.length === 0) {
        continue;
      }
      groups.push({
        label: displayName,
        options: values.slice(0, 5).map((facetValue) => ({
          label: facetValue.displayValue,
          detail: `${facetValue.count}`,
          onSelect: () => {
            filterSuggestions.select(facetValue);
            this.#collapse();
          },
        })),
      });
    }

    let optionIndex = 0;
    for (const group of groups) {
      for (const option of group.options) {
        option.index = optionIndex++;
      }
    }

    return groups;
  }

  #renderGroup(group) {
    const element = document.createElement('div');
    element.setAttribute('role', 'group');
    element.className = 'hsb__group';

    const label = document.createElement('div');
    label.className = 'hsb__group-label';
    label.id = `${this.#listbox.id}-group-${group.label.replace(/\W+/g, '-').toLowerCase()}`;
    label.textContent = group.label;
    element.setAttribute('aria-labelledby', label.id);

    element.append(label, ...group.options.map((option) => this.#renderOption(option)));
    return element;
  }

  #renderOption(option) {
    const element = document.createElement('div');
    element.id = `${this.#listbox.id}-option-${option.index}`;
    element.setAttribute('role', 'option');
    element.setAttribute('aria-selected', String(option.index === this.#activeIndex));
    element.className = 'hsb__option';

    const text = document.createElement('span');
    if (option.html) {
      // Safe: see the `highlightOptions` comment in `initialize`.
      text.innerHTML = option.html;
    } else {
      text.textContent = option.label;
    }
    element.append(text);

    if (option.detail) {
      const detail = document.createElement('span');
      detail.className = 'hsb__option-detail';
      detail.textContent = option.detail;
      element.append(detail);
    }

    element.addEventListener('mousedown', (event) => {
      event.preventDefault();
      option.onSelect();
    });

    return element;
  }

  #renderInstantProducts() {
    if (!this.#instantProducts) {
      return;
    }

    const products = this.#instantProducts.state.products.slice(0, 4);

    if (products.length === 0) {
      this.#productsPanel.replaceChildren();
      return;
    }

    const heading = document.createElement('h2');
    heading.className = 'hsb__products-title';
    heading.id = `${this.#listbox.id}-products-title`;
    heading.textContent = 'Top products';

    const list = document.createElement('ul');
    list.className = 'hsb__product-list';

    for (const product of products) {
      const item = document.createElement('li');
      const link = document.createElement('a');
      link.href = product.clickUri;
      link.className = 'hsb__product';

      if (product.ec_thumbnails?.[0]) {
        const image = document.createElement('img');
        image.src = product.ec_thumbnails[0];
        image.alt = '';
        image.width = 48;
        image.height = 48;
        link.append(image);
      }

      const name = document.createElement('span');
      name.className = 'hsb__product-name';
      name.textContent = product.ec_name ?? product.permanentid;
      link.append(name);

      if (typeof product.ec_price === 'number') {
        const price = document.createElement('span');
        price.className = 'hsb__product-price';
        price.textContent = product.ec_price.toLocaleString('en-US', {
          style: 'currency',
          currency: 'USD',
        });
        link.append(price);
      }

      // Reports the click to Coveo before navigating, the same way
      // `atomic-product-link` does for products in the main list.
      link.addEventListener('click', () => {
        this.#instantProducts.interactiveProduct({options: {product}}).select();
      });

      item.append(link);
      list.append(item);
    }

    const section = document.createElement('section');
    section.setAttribute('aria-labelledby', heading.id);
    section.append(heading, list);
    this.#productsPanel.replaceChildren(section);
  }

  // ---------------------------------------------------------------------------
  // Behaviour
  // ---------------------------------------------------------------------------

  #onInput() {
    const value = this.#input.value;
    this.#isExpanded = true;
    this.#activeIndex = -1;

    this.#searchBox.updateText(value);
  }

  #onStateChange() {
    // Filter-suggestion controllers come and go with the facets in the query
    // suggestions response, so their subscriptions are reconciled on every state
    // change rather than set up once.
    this.#reconcileFilterSuggestionSubscriptions();
    this.#syncFilterSuggestions();
    this.#renderPanel();
  }

  /**
   * Subscribes to each generated filter-suggestion controller.
   *
   * This is easy to miss and fails silently: a Headless controller's `subscribe`
   * only notifies when that controller's own `state` changes. The generator's state
   * is the list of facets, not their suggestion values, so subscribing to the
   * generator alone means suggestion values arrive without anything re-rendering.
   */
  #reconcileFilterSuggestionSubscriptions() {
    const controllers = this.#filterSuggestionsGenerator?.filterSuggestions ?? [];
    const currentFacetIds = new Set();

    for (const controller of controllers) {
      const {facetId} = controller.state;
      currentFacetIds.add(facetId);

      if (!this.#filterSuggestionsUnsubscribers.has(facetId)) {
        this.#filterSuggestionsUnsubscribers.set(
          facetId,
          controller.subscribe(() => this.#renderPanel())
        );
      }
    }

    for (const [facetId, unsubscribe] of this.#filterSuggestionsUnsubscribers) {
      if (!currentFacetIds.has(facetId)) {
        unsubscribe();
        this.#filterSuggestionsUnsubscribers.delete(facetId);
      }
    }
  }

  /**
   * Requests instant products for the highlighted suggestion.
   *
   * Deliberately not driven by the raw input. The Commerce API returns products for
   * a complete query, not a prefix: against the sample catalog, `shoe` returns
   * products while `sh` returns none. Atomic's own instant-products component works
   * the same way, updating its query from the active suggestion rather than from
   * every keystroke. Falling back to the first suggestion means products appear
   * before the user has arrowed into the list.
   */
  #syncInstantProducts() {
    if (!this.#instantProducts) {
      return;
    }

    const activeOption = this.#activeIndex >= 0 ? this.#options[this.#activeIndex] : undefined;
    const {value, suggestions} = this.#searchBox.state;
    const query = activeOption?.query ?? suggestions[0]?.rawValue ?? value;

    if (!query || query === this.#lastInstantProductsQuery) {
      return;
    }

    this.#lastInstantProductsQuery = query;
    this.#instantProducts.updateQuery(query);
  }

  /**
   * Requests filter suggestions for the current query.
   *
   * Two Headless behaviours shape this, and both are easy to trip over:
   *
   * 1. The generator derives one controller per facet from the *query suggestions*
   *    response, so no controller exists until the first suggestion request
   *    returns. Forwarding the query only on input would miss the first keystroke.
   * 2. A completed search clears the whole facet-search set, which discards any
   *    filter-suggestion response still in flight. Including the current response
   *    id in the key below means a search completing invalidates the key, and the
   *    suggestions are simply requested again against the cleared state.
   *
   * The key also keeps this safe to call from a state-change handler: without it,
   * every request would trigger another one.
   */
  #syncFilterSuggestions() {
    const controllers = this.#filterSuggestionsGenerator?.filterSuggestions ?? [];

    if (controllers.length === 0) {
      return;
    }

    const value = this.#searchBox.state.value;
    const key = `${value}|${this.#search.state.responseId}`;

    if (key === this.#lastFilterSuggestionsKey) {
      return;
    }

    this.#lastFilterSuggestionsKey = key;

    for (const filterSuggestions of controllers) {
      filterSuggestions.updateQuery(value);
    }
  }

  #onKeyDown(event) {
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        this.#moveActiveOption(1);
        break;
      case 'ArrowUp':
        event.preventDefault();
        this.#moveActiveOption(-1);
        break;
      case 'Enter':
        if (this.#activeIndex >= 0) {
          event.preventDefault();
          this.#options[this.#activeIndex].onSelect();
        }
        break;
      case 'Escape':
        this.#collapse();
        break;
      case 'Tab':
        this.#collapse();
        break;
      default:
        break;
    }
  }

  #moveActiveOption(offset) {
    if (this.#options.length === 0) {
      return;
    }

    this.#isExpanded = true;
    const count = this.#options.length;
    this.#activeIndex = (this.#activeIndex + offset + count + 1) % (count + 1);
    if (this.#activeIndex === count) {
      this.#activeIndex = -1;
    }

    this.#renderPanel();
  }

  #syncActiveDescendant() {
    const active = this.#listbox.querySelector('[aria-selected="true"]');

    if (this.#activeIndex < 0 || !active) {
      this.#input.removeAttribute('aria-activedescendant');
      return;
    }

    this.#input.setAttribute('aria-activedescendant', active.id);
    active.scrollIntoView({block: 'nearest'});
    // Some screen readers do not announce `aria-activedescendant` changes inside
    // a listbox that the user is not focused in, so the label is also pushed to
    // the assertive region. `atomic-commerce-search-box` does the same.
    this.#announce('search-suggestions', this.#options[this.#activeIndex].label);
  }

  #announceSuggestions() {
    if (this.#panel.hidden) {
      return;
    }
    const count = this.#options.length;
    this.#announce(
      'search-box',
      count === 0 ? 'No suggestions available.' : `${count} suggestions available.`
    );
  }

  #submit() {
    this.#collapse();

    if (this.#activeIndex >= 0) {
      this.#options[this.#activeIndex].onSelect();
      return;
    }

    this.#searchBox.submit();
  }

  /**
   * Completes a standalone submit.
   *
   * Replacing the standalone box means owning both halves of a contract that is
   * otherwise invisible: the destination `atomic-commerce-interface` reads
   * `coveo-standalone-search-box-data` from local storage in
   * `executeFirstRequest()` and uses its `value` as the initial query. Skip this
   * write and the search page loads with an empty query.
   */
  #handleRedirection() {
    const {redirectTo, value} = this.#searchBox.state;

    if (!redirectTo) {
      return;
    }

    localStorage.setItem(
      'coveo-standalone-search-box-data',
      JSON.stringify({value, enableQuerySyntax: false})
    );

    this.#searchBox.afterRedirection();
    window.location.href = redirectTo;
  }

  #clear() {
    this.#input.value = '';
    this.#searchBox.clear();
    this.#activeIndex = -1;
    this.#collapse();
    this.#announce('search-box', 'Search box cleared.');
    this.#input.focus();
  }

  #collapse() {
    this.#isExpanded = false;
    this.#activeIndex = -1;
    if (this.#panel) {
      this.#panel.hidden = true;
      this.#input.setAttribute('aria-expanded', 'false');
      this.#input.removeAttribute('aria-activedescendant');
    }
  }
}

customElements.define('hybrid-search-box', HybridSearchBox);

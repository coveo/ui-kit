import {
  buildSearchBox,
  buildStandaloneSearchBox,
  type CommerceEngine,
  type SearchBox,
  type StandaloneSearchBox,
} from '@coveo/headless/commerce';

/**
 * A deliberately minimal search box built with Headless, used in place of
 * `atomic-commerce-search-box` on otherwise standard Atomic pages.
 *
 * It submits queries and lists query suggestions in its own markup, and nothing
 * more. Everything else on the page (products, facets, sort, pager, URL)
 * reacts because the controller dispatches into the same engine the Atomic
 * components read from.
 *
 * Set `redirection-url` to make it standalone, like the Atomic search box:
 * submitting navigates to the search page instead of searching in place.
 */
export class HeadlessSearchBox extends HTMLElement {
  #searchBox?: SearchBox | StandaloneSearchBox;
  #input = document.createElement('input');
  #suggestions = document.createElement('ul');
  #unsubscribe?: () => void;

  connectedCallback() {
    const form = document.createElement('form');
    form.addEventListener('submit', (event) => {
      event.preventDefault();
      // In place, `submit()` runs the search on the shared engine and clears the
      // suggestions. Standalone, it asks the Commerce API where to redirect
      // instead, and the answer arrives as `state.redirectTo` (see `#render`).
      this.#searchBox?.submit();
    });

    this.#input.type = 'search';
    this.#input.placeholder = 'Search products';
    // Enabled by `initialize()`, once there is a controller to send the text to.
    this.#input.disabled = true;
    // `updateText()` stores the text as this box's query and fetches matching
    // suggestions in the same call; nothing is searched until submit.
    this.#input.addEventListener('input', () => this.#searchBox?.updateText(this.#input.value));
    // On focus, fetch suggestions for whatever is already typed, even nothing:
    // an empty query can return popular queries.
    this.#input.addEventListener('focus', () => this.#searchBox?.showSuggestions());

    const submit = document.createElement('button');
    submit.textContent = 'Search';

    form.append(this.#input, submit);
    this.append(form, this.#suggestions);
  }

  disconnectedCallback() {
    this.#unsubscribe?.();
  }

  /**
   * Binds the box to the page's commerce engine, the same one the Atomic
   * interfaces were initialized with.
   */
  initialize(engine: CommerceEngine) {
    const redirectionUrl = this.getAttribute('redirection-url');
    // Both controllers register a query and a query-suggestion slot in the
    // engine under this box's own id. `buildSearchBox` defaults
    // (`clearFilters: true`, `enableResults: false`) match what
    // `atomic-commerce-search-box` uses, so a query from this box resets
    // facets and fills the Atomic product list the same way.
    // `buildStandaloneSearchBox` is the same controller with a redirection step
    // on submit, for pages that show no results.
    this.#searchBox = redirectionUrl
      ? buildStandaloneSearchBox(engine, {options: {redirectionUrl}})
      : buildSearchBox(engine);
    // `subscribe` calls back right away, then after every engine change that
    // affects this controller's state: typing, suggestions arriving, searches
    // completing (including those started by Atomic components), URL restores.
    this.#unsubscribe = this.#searchBox.subscribe(() => this.#render());
    this.#input.disabled = false;
  }

  #render() {
    const {state} = this.#searchBox!;

    // Only the standalone controller has `redirectTo`. It is filled once the
    // Commerce API answers the submit: the search page URL, or a merchandiser
    // redirect configured for that query.
    if ('redirectTo' in state && state.redirectTo) {
      this.#redirect(this.#searchBox as StandaloneSearchBox);
      return;
    }

    const {value, suggestions} = state;

    // The query also changes without typing: restored from the URL, by the back
    // button, or by a standalone search box on another page.
    if (this.#input.value !== value) {
      this.#input.value = value;
    }

    // `suggestions` also offers `highlightedValue`, with the typed part marked;
    // `rawValue` is the plain query text. The list is emptied by the controller
    // after a submit or a selection, and CSS hides it when empty.
    this.#suggestions.replaceChildren(
      ...suggestions.map(({rawValue}) => {
        const button = document.createElement('button');
        button.type = 'button';
        button.textContent = rawValue;
        // Keeps the focus in the input, so the list stays open until the click lands.
        button.addEventListener('mousedown', (event) => event.preventDefault());
        button.addEventListener('click', () => {
          // Sets the suggestion as the query, then searches (or redirects, when
          // standalone).
          this.#searchBox?.selectSuggestion(rawValue);
          this.#input.blur();
        });

        const item = document.createElement('li');
        item.append(button);
        return item;
      })
    );
  }

  /**
   * The search page's `atomic-commerce-interface` reads this local storage entry
   * in `executeFirstRequest()` and uses it as the first query. It is the same
   * handoff `atomic-commerce-search-box` performs in standalone mode.
   */
  #redirect(searchBox: StandaloneSearchBox) {
    const {redirectTo, value} = searchBox.state;
    localStorage.setItem('coveo-standalone-search-box-data', JSON.stringify({value}));
    // Clears `redirectTo`, so the next state change does not redirect again.
    searchBox.afterRedirection();
    window.location.href = redirectTo;
  }
}

customElements.define('headless-search-box', HeadlessSearchBox);

declare global {
  interface HTMLElementTagNameMap {
    'headless-search-box': HeadlessSearchBox;
  }
}

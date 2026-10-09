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
      this.#searchBox?.submit();
    });

    this.#input.type = 'search';
    this.#input.placeholder = 'Search products';
    this.#input.disabled = true;
    this.#input.addEventListener('input', () => this.#searchBox?.updateText(this.#input.value));
    this.#input.addEventListener('focus', () => this.#searchBox?.showSuggestions());

    const submit = document.createElement('button');
    submit.textContent = 'Search';

    form.append(this.#input, submit);
    this.append(form, this.#suggestions);
  }

  disconnectedCallback() {
    this.#unsubscribe?.();
  }

  initialize(engine: CommerceEngine) {
    const redirectionUrl = this.getAttribute('redirection-url');
    this.#searchBox = redirectionUrl
      ? buildStandaloneSearchBox(engine, {options: {redirectionUrl}})
      : buildSearchBox(engine);
    this.#unsubscribe = this.#searchBox.subscribe(() => this.#render());
    this.#input.disabled = false;
  }

  #render() {
    const {state} = this.#searchBox!;

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

    this.#suggestions.replaceChildren(
      ...suggestions.map(({rawValue}) => {
        const button = document.createElement('button');
        button.type = 'button';
        button.textContent = rawValue;
        // Keeps the focus in the input, so the list stays open until the click lands.
        button.addEventListener('mousedown', (event) => event.preventDefault());
        button.addEventListener('click', () => {
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

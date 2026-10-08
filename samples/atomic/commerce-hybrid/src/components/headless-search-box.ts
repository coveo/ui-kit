import {buildSearchBox, type CommerceEngine, type SearchBox} from '@coveo/headless/commerce';

/**
 * A deliberately minimal search box built with the Headless `SearchBox`
 * controller, used in place of `atomic-commerce-search-box` on an otherwise
 * standard Atomic search page.
 *
 * It submits queries and lists query suggestions in its own markup, and nothing
 * more. Everything else on the page (products, facets, sort, pager, URL)
 * reacts because the controller dispatches into the same engine the Atomic
 * components read from.
 */
export class HeadlessSearchBox extends HTMLElement {
  #searchBox?: SearchBox;
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
    this.#searchBox = buildSearchBox(engine);
    this.#unsubscribe = this.#searchBox.subscribe(() => this.#render());
    this.#input.disabled = false;
  }

  #render() {
    const {value, suggestions} = this.#searchBox!.state;

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
}

customElements.define('headless-search-box', HeadlessSearchBox);

declare global {
  interface HTMLElementTagNameMap {
    'headless-search-box': HeadlessSearchBox;
  }
}

import {SearchBox, StandaloneSearchBox} from '@coveo/headless/commerce';
import {i18n} from 'i18next';
import {html, LitElement, TemplateResult} from 'lit';
import {customElement} from 'lit/decorators.js';
import {vi} from 'vitest';
import {
  SearchBoxSuggestions,
  SearchBoxSuggestionsEvent,
} from '../src/components/common/suggestions/suggestions-common.js';
import {createTestI18n} from './i18n-utils.js';
import {fixture} from './testing-helpers/fixture.js';

@customElement('atomic-commerce-search-box')
export class FixtureAtomicCommerceSearchBox extends LitElement {
  public searchBoxSuggestionEventsQueue: CustomEvent<
    SearchBoxSuggestionsEvent<SearchBox | StandaloneSearchBox>
  >[] = [];

  i18n!: i18n;
  suggestions: SearchBoxSuggestions[] = [];
  #internalBindings!: {};
  get bindings() {
    return {
      ...this.#internalBindings,
      i18n: this.i18n,
    };
  }

  setBindings(bindings: {}) {
    this.#internalBindings = bindings;
  }

  constructor() {
    super();
    createTestI18n().then((i18n) => {
      this.i18n = i18n;
    });
  }

  connectedCallback() {
    super.connectedCallback();
    this.addEventListener(
      'atomic/searchBoxSuggestion/register',
      (event: Event) => {
        const customEvent = event as CustomEvent<
          SearchBoxSuggestionsEvent<SearchBox | StandaloneSearchBox>
        >;
        this.searchBoxSuggestionEventsQueue.push(customEvent);
      }
    );
  }

  public async initialize() {
    this.searchBoxSuggestionEventsQueue.forEach((event) => {
      // @ts-expect-error normal
      this.suggestions.push(event.detail(this.bindings));
    });
  }

  render() {
    return html`<div>
      Fixture commerce search box
      ${this.suggestions.map((suggestion) => {
        return html`
          <div>
            ${suggestion.renderItems().map((item) => {
              return html`<div>${item.content}</div>`;
            })}
          </div>
        `;
      })}
    </div>`;
  }
}

export const defaultBindings = {
  engine: {
    dispatch: vi.fn(),
  },
  id: 'search-box-1',
  searchBoxController: {
    state: {
      suggestions: [
        {highlightedValue: 'suggestion1Highlighted', rawValue: 'suggestion1'},
      ],
      value: '',
    },
    selectSuggestion: vi.fn(),
  },
  getSuggestions: () => {
    return [
      {
        highlightedValue: 'suggestion1',
        rawValue: 'suggestion1',
      },
    ];
  },
};

export async function renderInAtomicCommerceSearchBox<T extends LitElement>({
  template,
  selector,
  bindings,
}: {
  template: TemplateResult;
  selector: string;
  bindings?: {};
}): Promise<{
  element: T;
  atomicCommerceSearchBox: FixtureAtomicCommerceSearchBox;
}> {
  const atomicCommerceSearchBox = await fixture<FixtureAtomicCommerceSearchBox>(
    html`<atomic-commerce-search-box>${template}</atomic-commerce-search-box>`
  );

  if (!bindings) {
    atomicCommerceSearchBox.setBindings(defaultBindings);
  } else {
    atomicCommerceSearchBox.setBindings({...defaultBindings, ...bindings});
  }

  await atomicCommerceSearchBox.updateComplete;

  const element = atomicCommerceSearchBox.querySelector<T>(selector)!;
  return {element, atomicCommerceSearchBox};
}

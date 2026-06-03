import type {SearchBox, StandaloneSearchBox} from '@coveo/headless/commerce';
import type {i18n} from 'i18next';
import {html, LitElement, nothing, render, type TemplateResult} from 'lit';
import {customElement, property, state} from 'lit/decorators.js';
import {vi} from 'vitest';
import type {
  SearchBoxSuggestions,
  SearchBoxSuggestionsBindings,
  SearchBoxSuggestionsEvent,
} from '@/src/components/common/suggestions/suggestions-types';
import {fixture} from '@/vitest-utils/testing-helpers/fixture';
import {createTestI18n} from '@/vitest-utils/testing-helpers/i18n-utils';

type CommerceSearchBoxBindings = SearchBoxSuggestionsBindings<
  SearchBox | StandaloneSearchBox
>;

@customElement('atomic-commerce-search-box')
export class FixtureAtomicCommerceSearchBox extends LitElement {
  public searchBoxSuggestionEventsQueue: CustomEvent<
    SearchBoxSuggestionsEvent<SearchBox | StandaloneSearchBox>
  >[] = [];

  i18n!: i18n;
  suggestions: SearchBoxSuggestions[] = [];
  #internalBindings!: {};
  @state()
  template!: TemplateResult;
  get bindings() {
    return {
      ...this.#internalBindings,
      i18n: this.i18n,
    };
  }

  set bindings(bindings: Partial<CommerceSearchBoxBindings>) {
    this.#internalBindings = bindings as CommerceSearchBoxBindings;
  }

  @property({reflect: true, type: Boolean})
  get ready() {
    return Boolean(this.i18n && this.bindings);
  }

  constructor() {
    super();
    createTestI18n().then((i18n) => {
      this.i18n = i18n;
    });
  }

  setRenderTemplate(template: TemplateResult) {
    this.template = template;
  }

  searchBoxSuggestionsEventListener = vi
    .fn()
    .mockImplementation((event: CustomEvent) => event.detail(this.bindings));

  connectedCallback() {
    super.connectedCallback();
    this.addEventListener(
      'atomic/searchBoxSuggestion/register',
      this.searchBoxSuggestionsEventListener
    );
  }

  render() {
    const container = document.createElement('div');
    render(this.template, container);

    return this.ready
      ? this.replaceChildren(container.firstElementChild!)
      : nothing;
  }
}

export const defaultBindings = {
  engine: {
    dispatch: vi.fn(),
    logger: {
      warn: vi.fn(),
    },
  } as unknown as CommerceSearchBoxBindings['engine'],
  id: 'search-box-1',
  numberOfQueries: 3,
  store: {
    onChange: vi.fn(),
    isMobile: vi.fn(() => false),
  } as unknown as CommerceSearchBoxBindings['store'],
  searchBoxController: {
    state: {
      suggestions: [
        {highlightedValue: 'suggestion1Highlighted', rawValue: 'suggestion1'},
      ],
      value: '',
    },
    selectSuggestion: vi.fn(),
    updateText: vi.fn(),
    submit: vi.fn(),
  } as unknown as SearchBox | StandaloneSearchBox,
  getSuggestions: vi.fn(() => Array(1)),
  triggerSuggestions: vi.fn(),
  getSuggestionElements: vi.fn(() => []),
  suggestedQuery: vi.fn(() => 'the query'),
  clearSuggestions: vi.fn(),
};

defaultBindings satisfies Partial<CommerceSearchBoxBindings>;
type MinimalBindings = Partial<CommerceSearchBoxBindings> &
  typeof defaultBindings;

export async function renderInAtomicCommerceSearchBox<T extends LitElement>({
  template,
  selector,
  bindings,
}: {
  template: TemplateResult;
  selector: string;
  bindings?:
    | Partial<CommerceSearchBoxBindings>
    | ((bindings: MinimalBindings) => MinimalBindings);
}): Promise<{
  element: T;
  searchBox: FixtureAtomicCommerceSearchBox;
}> {
  const searchBox = await fixture<FixtureAtomicCommerceSearchBox>(
    html`<atomic-commerce-search-box></atomic-commerce-search-box>`
  );

  if (typeof bindings === 'function') {
    searchBox.bindings = bindings(defaultBindings);
  } else {
    searchBox.bindings = {...defaultBindings, ...bindings};
  }
  searchBox.setRenderTemplate(template);

  await searchBox.updateComplete;

  const element = searchBox!.querySelector<T>(selector)!;
  return {element, searchBox};
}

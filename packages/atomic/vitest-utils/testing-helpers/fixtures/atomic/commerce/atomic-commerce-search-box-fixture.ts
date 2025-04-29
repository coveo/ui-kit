import {
  SearchBoxSuggestions,
  SearchBoxSuggestionsBindings,
  SearchBoxSuggestionsEvent,
} from '@/src/components/common/suggestions/suggestions-common.js';
import {SearchBox, StandaloneSearchBox} from '@coveo/headless/commerce';
import {i18n} from 'i18next';
import {html, LitElement, nothing, TemplateResult} from 'lit';
import {customElement, property, state} from 'lit/decorators.js';
import {vi} from 'vitest';
import {createTestI18n} from '../../../../i18n-utils.js';
import {fixture} from '../../../fixture.js';

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
  #internalBindings!: Exclude<CommerceSearchBoxBindings, 'i18n'>;
  @state()
  template!: TemplateResult;
  get bindings(): CommerceSearchBoxBindings {
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

  protected render() {
    return this.ready ? this.template : nothing;
  }
}

export const defaultBindings = {
  engine: {dispatch: vi.fn()} as unknown as CommerceSearchBoxBindings['engine'],
  id: 'test-search-box-id',
  numberOfQueries: 42,
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

  if (!bindings) {
    searchBox.bindings = {} as CommerceSearchBoxBindings;
  } else if (typeof bindings === 'function') {
    searchBox.bindings = bindings(defaultBindings);
  } else {
    searchBox.bindings = bindings;
  }
  searchBox.setRenderTemplate(template);

  await searchBox.updateComplete;

  const element = searchBox.shadowRoot!.querySelector<T>(selector)!;
  return {element, searchBox};
}

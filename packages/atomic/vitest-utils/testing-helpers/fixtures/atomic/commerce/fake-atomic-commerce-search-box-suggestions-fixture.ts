import type {SearchBox} from '@coveo/headless/commerce';
import {LitElement} from 'lit';
import {customElement, property, state} from 'lit/decorators.js';
import type {CommerceBindings} from '@/src/components/commerce/atomic-commerce-interface/atomic-commerce-interface';
import {dispatchSearchBoxSuggestionsEvent} from '@/src/components/common/suggestions/suggestions-events';
import type {
  SearchBoxSuggestionElement,
  SearchBoxSuggestions,
  SearchBoxSuggestionsBindings,
} from '@/src/components/common/suggestions/suggestions-types';
import type {SearchBoxSuggestionsComponent} from '@/src/decorators/types';

@customElement('fake-atomic-commerce-search-box-suggestions')
export class FixtureFakeAtomicCommerceSearchBoxSuggestions
  extends LitElement
  implements SearchBoxSuggestionsComponent<CommerceBindings>
{
  bindings!: SearchBoxSuggestionsBindings<SearchBox, CommerceBindings>;
  @state() error!: Error;

  @property({type: Number, attribute: 'suggestion-count'})
  suggestionCount = 3;

  connectedCallback() {
    super.connectedCallback();
    dispatchSearchBoxSuggestionsEvent<SearchBox, CommerceBindings>(
      (bindings) => {
        this.bindings = bindings;
        return this.initialize();
      },
      this,
      ['atomic-commerce-search-box']
    );
  }

  initialize(): SearchBoxSuggestions {
    return {
      position: 0,
      renderItems: () => this.renderItems(),
    };
  }

  private renderItems(): SearchBoxSuggestionElement[] {
    return Array.from({length: this.suggestionCount}, (_, i) => {
      const num = i + 1;
      const div = document.createElement('div');
      div.textContent = `suggestion ${num}`;
      return {
        key: `suggestion-${num}`,
        content: div,
        query: `suggestion ${num}`,
      };
    });
  }
}

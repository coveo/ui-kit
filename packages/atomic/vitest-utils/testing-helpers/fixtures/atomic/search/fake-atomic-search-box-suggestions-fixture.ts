import type {SearchBox} from '@coveo/headless';
import {LitElement} from 'lit';
import {customElement, property, state} from 'lit/decorators.js';
import {dispatchSearchBoxSuggestionsEvent} from '@/src/components/common/suggestions/suggestions-events';
import type {
  SearchBoxSuggestionElement,
  SearchBoxSuggestions,
  SearchBoxSuggestionsBindings,
} from '@/src/components/common/suggestions/suggestions-types';
import type {Bindings} from '@/src/components/search/atomic-search-interface/atomic-search-interface';
import type {SearchBoxSuggestionsComponent} from '@/src/decorators/types';

@customElement('fake-atomic-search-box-suggestions')
export class FixtureFakeAtomicSearchBoxSuggestions
  extends LitElement
  implements SearchBoxSuggestionsComponent<Bindings>
{
  bindings!: SearchBoxSuggestionsBindings<SearchBox, Bindings>;
  @state() error!: Error;

  @property({type: Number, attribute: 'suggestion-count'})
  suggestionCount = 3;

  @property({type: Boolean, attribute: 'without-query'})
  withoutQuery = false;

  @property({type: Boolean, attribute: 'recent-query-clear'})
  recentQueryClear = false;

  @property({type: String, attribute: 'suggestion-part'})
  suggestionPart = '';

  connectedCallback() {
    super.connectedCallback();
    dispatchSearchBoxSuggestionsEvent<SearchBox, Bindings>(
      (bindings) => {
        this.bindings = bindings;
        return this.initialize();
      },
      this,
      ['atomic-search-box']
    );
  }

  initialize(): SearchBoxSuggestions {
    return {
      position: 0,
      renderItems: () => this.renderItems(),
    };
  }

  private renderItems(): SearchBoxSuggestionElement[] {
    if (this.recentQueryClear) {
      const div = document.createElement('div');
      div.textContent = 'clear recent searches';
      return [
        {
          key: 'recent-query-clear',
          content: div,
        },
      ];
    }

    return Array.from({length: this.suggestionCount}, (_, i) => {
      const num = i + 1;
      const div = document.createElement('div');
      div.textContent = `suggestion ${num}`;
      const suggestion: SearchBoxSuggestionElement = {
        key: `suggestion-${num}`,
        content: div,
      };
      if (!this.withoutQuery) {
        suggestion.query = `suggestion ${num}`;
      }
      if (this.suggestionPart) {
        suggestion.part = this.suggestionPart;
      }
      return suggestion;
    });
  }
}

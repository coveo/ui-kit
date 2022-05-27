import {Component, Element, State, h} from '@stencil/core';
import {buildInstantResults, InstantResults, Result} from '@coveo/headless';

import {
  dispatchSearchBoxSuggestionsEvent,
  SearchBoxSuggestionItem,
  SearchBoxSuggestions,
  SearchBoxSuggestionsBindings,
} from '../suggestions-common';

/**
 * The `atomic-search-box-instant-results` component can be added as a child of an `atomic-search-box` component, allowing for the configuration of instant results behavior.
 * @internal
 */
@Component({
  tag: 'atomic-search-box-instant-results',
  shadow: true,
})
export class AtomicSearchBoxRecentQueries {
  private bindings!: SearchBoxSuggestionsBindings;

  @Element() private host!: HTMLElement;

  @State() public error!: Error;
  private instantResults!: InstantResults;

  private results: Result[] = [];

  componentWillLoad() {
    try {
      dispatchSearchBoxSuggestionsEvent((bindings) => {
        this.bindings = bindings;
        return this.initialize();
      }, this.host);
    } catch (error) {
      this.error = error as Error;
    }
  }

  private renderItems(): SearchBoxSuggestionItem[] {
    const results = this.instantResults.state.results.length
      ? this.instantResults.state.results
      : this.results;
    return results.map((result, i) => ({
      key: `instant-result-${i}`,
      query: '',
      content: <div class="flex items-center break-all">{result.title}</div>,
      onSelect: () => {
        // TODO: ADD LOGS?
      },
    }));
  }

  public initialize(): SearchBoxSuggestions {
    this.instantResults = buildInstantResults(this.bindings.engine, {
      options: {
        maxResultsPerQuery: 4,
      },
    });

    return {
      position: Array.from(this.host.parentNode!.children).indexOf(this.host),
      panel: 'right',
      onSuggestedQueryChange: (q) => {
        this.instantResults.updateQuery(q);
        return this.onSuggestedQueryChange();
      },
      renderItems: () => this.renderItems(),
    };
  }

  private onSuggestedQueryChange() {
    return new Promise<void>((resolve) => {
      const unsubscribe = this.instantResults.subscribe(() => {
        const state = this.instantResults.state;
        if (!state.isLoading) {
          if (state.results.length) {
            this.results = state.results;
          }
          unsubscribe();
          resolve();
        }
      });
    });
  }

  public render() {
    if (this.error) {
      return (
        <atomic-component-error
          element={this.host}
          error={this.error}
        ></atomic-component-error>
      );
    }
  }
}

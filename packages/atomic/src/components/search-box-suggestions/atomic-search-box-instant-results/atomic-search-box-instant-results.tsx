import {Component, Element, State, h, Prop} from '@stencil/core';
import {buildInstantResults, InstantResults, Result} from '@coveo/headless';

import {
  dispatchSearchBoxSuggestionsEvent,
  SearchBoxSuggestionItem,
  SearchBoxSuggestions,
  SearchBoxSuggestionsBindings,
} from '../suggestions-common';
import {cleanUpString} from '../../../utils/string-utils';
import {
  BaseResultList,
  ResultListCommon,
} from '../../result-lists/result-list-common';
import {
  ResultDisplayDensity,
  ResultDisplayImageSize,
  ResultDisplayLayout,
} from '../../atomic-result/atomic-result-display-options';

/**
 * The `atomic-search-box-instant-results` component can be added as a child of an `atomic-search-box` component, allowing for the configuration of instant results behavior.
 * @internal
 */
@Component({
  tag: 'atomic-search-box-instant-results',
  shadow: true,
})
export class AtomicSearchBoxInstantResults implements BaseResultList {
  public bindings!: SearchBoxSuggestionsBindings;

  @Element() public host!: HTMLElement;

  @State() public error!: Error;
  @State() public templateHasError = false;
  private instantResults!: InstantResults;

  private results: Result[] = [];
  public resultListCommon!: ResultListCommon;
  /**
   * The desired layout to use when displaying results. Layouts affect how many results to display per row and how visually distinct they are from each other.
   */
  @Prop({reflect: true}) display: ResultDisplayLayout = 'list';

  /**
   * The spacing of various elements in the result list, including the gap between results, the gap between parts of a result, and the font sizes of different parts in a result.
   */
  @Prop({reflect: true}) density: ResultDisplayDensity = 'normal';
  /**
   * The expected size of the image displayed in the results.
   */
  @Prop({reflect: true}) imageSize: ResultDisplayImageSize = 'icon';

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
    if (!this.bindings.suggestedQuery()) {
      return [];
    }
    const results = this.instantResults.state.results.length
      ? this.instantResults.state.results
      : this.results;
    return results.map((result: Result) => ({
      key: `instant-result-${cleanUpString(result.title)}`,
      query: '',
      content: (
        <atomic-result
          key={`instant-results-${result.uniqueId}`}
          part="outline"
          result={result}
          engine={this.bindings.engine}
          display={this.display}
          density={this.density}
          imageSize={this.imageSize}
          content={this.resultListCommon.getContentOfResultTemplate(result)}
        ></atomic-result>
      ),
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

    this.resultListCommon = new ResultListCommon({
      host: this.host,
      bindings: this.bindings,
      templateElements: this.host.querySelectorAll('atomic-result-template'),
      onReady: () => {},
      onError: () => {
        this.templateHasError = true;
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

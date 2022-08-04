import {Component, Element, State, h, Prop, Method} from '@stencil/core';
import {
  buildInstantResults,
  buildResultList,
  InstantResults,
  Result,
} from '@coveo/headless';

import {
  dispatchSearchBoxSuggestionsEvent,
  SearchBoxSuggestionElement,
  SearchBoxSuggestions,
  SearchBoxSuggestionsBindings,
} from '../suggestions-common';
import {encodeForDomAttribute} from '../../../../utils/string-utils';
import {
  BaseResultList,
  ResultListCommon,
  ResultRenderingFunction,
} from '../../result-lists/result-list-common';
import {
  ResultDisplayDensity,
  ResultDisplayImageSize,
  ResultDisplayLayout,
} from '../../../common/layout/display-options';
import {Button} from '../../../common/button';

/**
 * The `atomic-search-box-instant-results` component can be added as a child of an `atomic-search-box` component, allowing for the configuration of instant results behavior.
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
  private renderingFunction?: ResultRenderingFunction | undefined;

  /**
   * Sets a rendering function to bypass the standard HTML template mechanism for rendering results.
   * You can use this function while working with web frameworks that don't use plain HTML syntax, e.g., React, Angular or Vue.
   *
   * Do not use this method if you integrate Atomic in a plain HTML deployment.
   *
   * @param render
   */
  @Method() public async setRenderFunction(render: ResultRenderingFunction) {
    this.renderingFunction = render;
  }
  /**
   * The maximum number of results to show.
   */
  @Prop({reflect: true}) maxResultsPerQuery = 4;
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

  private getLink(el: HTMLElement): HTMLElement | null {
    return (
      el
        ?.querySelector('atomic-result')
        ?.shadowRoot?.querySelector('atomic-result-link a') || null
    );
  }

  private handleLinkClick(el: HTMLElement, hasModifier: boolean) {
    const setTarget = (value: string) => el.setAttribute('target', value);
    const initialTarget = el.getAttribute('target');

    hasModifier && setTarget('_blank');
    el.click();
    hasModifier && setTarget(initialTarget || '');

    return true;
  }

  private renderItems(): SearchBoxSuggestionElement[] {
    if (!this.bindings.suggestedQuery() || this.bindings.store.isMobile()) {
      return [];
    }
    const results = this.instantResults.state.results.length
      ? this.instantResults.state.results
      : this.results;

    const elements: SearchBoxSuggestionElement[] = results.map(
      (result: Result) => ({
        key: `instant-result-${encodeForDomAttribute(result.uniqueId)}`,
        part: 'instant-results-item',
        content: (
          <atomic-result
            key={`instant-result-${encodeForDomAttribute(result.uniqueId)}`}
            part="outline"
            result={result}
            engine={this.bindings.engine}
            display={this.display}
            density={this.density}
            imageSize={this.imageSize}
            content={this.resultListCommon.getContentOfResultTemplate(result)}
            stopPropagation={false}
            renderingFunction={this.renderingFunction}
          ></atomic-result>
        ),
        onSelect: (e: MouseEvent) => {
          const link = this.getLink(e.target as HTMLElement);

          if (!link) {
            return;
          }
          this.handleLinkClick(link, e.ctrlKey || e.metaKey);
        },
      })
    );
    if (elements.length) {
      elements.push({
        key: 'instant-results-show-all-button',
        content: (
          <Button part="instant-results-show-all-button" style="text-primary">
            {this.bindings.i18n.t('show-all-results')}
          </Button>
        ),
        part: 'instant-results-show-all',
        onSelect: () => {
          this.bindings.clearSuggestions();
          this.bindings.searchBoxController.updateText(
            this.instantResults.state.q
          );
          this.bindings.searchBoxController.submit();
        },
      });
    }
    return elements;
  }

  public initialize(): SearchBoxSuggestions {
    this.instantResults = buildInstantResults(this.bindings.engine, {
      options: {
        maxResultsPerQuery: this.maxResultsPerQuery,
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

    buildResultList(this.bindings.engine, {
      options: {fieldsToInclude: this.bindings.store.state.fieldsToInclude},
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
    if (
      !this.bindings.getSuggestionElements().length &&
      !this.bindings.searchBoxController.state.value
    ) {
      console.warn(
        "There doesn't seem to be any query suggestions configured. Make sure to include either an atomic-search-box-query-suggestions or atomic-search-box-recent-queries in your search box in order to see some instant results."
      );
    }

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

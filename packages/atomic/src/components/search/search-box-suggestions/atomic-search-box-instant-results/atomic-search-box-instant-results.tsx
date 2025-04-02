import {
  buildInstantResults,
  buildInteractiveInstantResult,
  InstantResults,
  Result,
  SearchBox,
} from '@coveo/headless';
import {Component, Element, State, h, Prop, Method} from '@stencil/core';
import {InitializableComponent} from '../../../../utils/initialization-utils';
import {encodeForDomAttribute} from '../../../../utils/string-utils';
import {ItemRenderingFunction} from '../../../common/item-list/item-list-common';
import {ItemTemplateProvider} from '../../../common/item-list/item-template-provider';
import {
  ItemDisplayDensity,
  ItemDisplayImageSize,
  ItemDisplayLayout,
} from '../../../common/layout/display-options';
import {
  getPartialInstantItemElement,
  getPartialInstantItemShowAllElement,
  InstantItemShowAllButton,
} from '../../../common/suggestions/instant-item';
import {
  dispatchSearchBoxSuggestionsEvent,
  SearchBoxSuggestionElement,
  SearchBoxSuggestions,
  SearchBoxSuggestionsBindings,
} from '../../../common/suggestions/suggestions-common';
import {Bindings} from '../../atomic-search-interface/atomic-search-interface';

export type AriaLabelGenerator = (
  bindings: Bindings,
  result: Result
) => string | undefined;

/**
 * The `atomic-search-box-instant-results` component can be added as a child of an `atomic-search-box` component, allowing for the configuration of instant results behavior.
 *
 * This component does not support accessibility out-of-the-box. To do so, see [Instant Results Accessibility](https://docs.coveo.com/en/atomic/latest/usage/accessibility/#instant-results-accessibility).
 *
 * This component is not supported on mobile.
 *
 * @slot default - The default slot where the instant results are rendered.
 */
@Component({
  tag: 'atomic-search-box-instant-results',
  shadow: true,
})
export class AtomicSearchBoxInstantResults implements InitializableComponent {
  public bindings!: SearchBoxSuggestionsBindings<SearchBox, Bindings>;
  private itemRenderingFunction: ItemRenderingFunction;
  private results: Result[] = [];
  private itemTemplateProvider!: ItemTemplateProvider;
  private instantResults!: InstantResults;
  private display: ItemDisplayLayout = 'list';

  @Element() public host!: HTMLElement;

  @State() public error!: Error;
  @State() private templateHasError = false;

  /**
   * Sets a rendering function to bypass the standard HTML template mechanism for rendering results.
   * You can use this function while working with web frameworks that don't use plain HTML syntax, e.g., React, Angular or Vue.
   *
   * Do not use this method if you integrate Atomic in a plain HTML deployment.
   *
   * @param resultRenderingFunction
   */
  @Method() public async setRenderFunction(
    resultRenderingFunction: ItemRenderingFunction
  ) {
    this.itemRenderingFunction = resultRenderingFunction;
  }
  /**
   * The maximum number of results to show.
   */
  @Prop({reflect: true}) public maxResultsPerQuery = 4;
  /**
   * The spacing of various elements in the result list, including the gap between results, the gap between parts of a result, and the font sizes of different parts in a result.
   */
  @Prop({reflect: true}) public density: ItemDisplayDensity = 'normal';
  /**
   * The expected size of the image displayed in the results.
   */
  @Prop({reflect: true}) public imageSize: ItemDisplayImageSize = 'icon';
  /**
   * The callback to generate an [`aria-label`](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Attributes/aria-label) for a given result so that accessibility tools can fully describe what's visually rendered by a result.
   *
   * By default, or if an empty string is returned, `result.title` is used.
   */
  @Prop() public ariaLabelGenerator?: AriaLabelGenerator;

  public componentWillLoad() {
    try {
      dispatchSearchBoxSuggestionsEvent<SearchBox, Bindings>((bindings) => {
        this.bindings = bindings;
        return this.initialize();
      }, this.host);
    } catch (error) {
      this.error = error as Error;
    }
  }

  private getLink(el: HTMLElement): HTMLElement | null {
    const atomicResult =
      el.tagName === 'ATOMIC-RESULT' ? el : el?.querySelector('atomic-result');

    return (
      atomicResult?.shadowRoot?.querySelector(
        'atomic-result-link a:not([slot])'
      ) || null
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
      (result: Result) => {
        const partialItem = getPartialInstantItemElement(
          this.bindings.i18n,
          this.ariaLabelGenerator?.(this.bindings, result) || result.title,
          result.uniqueId
        );
        return {
          ...partialItem,
          content: (
            <atomic-result
              key={`instant-result-${encodeForDomAttribute(result.uniqueId)}`}
              part="outline"
              result={result}
              interactiveResult={buildInteractiveInstantResult(
                this.bindings.engine,
                {
                  options: {result},
                }
              )}
              display={this.display}
              density={this.density}
              imageSize={this.imageSize}
              content={this.itemTemplateProvider.getTemplateContent(result)}
              stopPropagation={false}
              renderingFunction={this.itemRenderingFunction}
            ></atomic-result>
          ),
          onSelect: (e: MouseEvent) => {
            const link = this.getLink(e.target as HTMLElement);

            if (!link) {
              return;
            }
            this.handleLinkClick(link, e.ctrlKey || e.metaKey);
          },
        };
      }
    );
    if (elements.length) {
      const partialItem = getPartialInstantItemShowAllElement(
        this.bindings.i18n
      );
      elements.push({
        ...partialItem,
        content: <InstantItemShowAllButton i18n={this.bindings.i18n} />,
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

    this.itemTemplateProvider = new ItemTemplateProvider({
      includeDefaultTemplate: true,
      templateElements: Array.from(
        this.host.querySelectorAll('atomic-result-template')
      ),
      getResultTemplateRegistered: () => true,
      setResultTemplateRegistered: () => {},
      getTemplateHasError: () => this.templateHasError,
      setTemplateHasError: (value: boolean) => {
        this.templateHasError = value;
      },
      bindings: this.bindings,
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

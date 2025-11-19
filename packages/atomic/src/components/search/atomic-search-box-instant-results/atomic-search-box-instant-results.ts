import {
  buildInstantResults,
  buildInteractiveInstantResult,
  type InstantResults,
  type Result,
  type SearchBox,
} from '@coveo/headless';
import {html, LitElement, nothing, render} from 'lit';
import {customElement, property, state} from 'lit/decorators.js';
import {keyed} from 'lit/directives/keyed.js';
import type {ItemRenderingFunction} from '@/src/components/common/item-list/item-list-common';
import {ResultTemplateProvider} from '@/src/components/common/item-list/result-template-provider';
import type {
  ItemDisplayDensity,
  ItemDisplayImageSize,
  ItemDisplayLayout,
} from '@/src/components/common/layout/item-layout-utils';
import {
  getPartialInstantItemElement,
  getPartialInstantItemShowAllElement,
  renderInstantItemShowAllButton,
} from '@/src/components/common/suggestions/instant-item';
import {dispatchSearchBoxSuggestionsEvent} from '@/src/components/common/suggestions/suggestions-events';
import type {
  SearchBoxSuggestionElement,
  SearchBoxSuggestions,
  SearchBoxSuggestionsBindings,
} from '@/src/components/common/suggestions/suggestions-types';
import type {Bindings} from '@/src/components/search/atomic-search-interface/interfaces';
import {errorGuard} from '@/src/decorators/error-guard';
import type {SearchBoxSuggestionsComponent} from '@/src/decorators/types';
import {encodeForDomAttribute} from '@/src/utils/string-utils';

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
 * @part instant-results-show-all-button - The 'See all results' button.
 * @part instant-results-item - The individual instant result items.
 *
 * @slot default - The default slot where the instant results are rendered.
 */
@customElement('atomic-search-box-instant-results')
export class AtomicSearchBoxInstantResults
  extends LitElement
  implements SearchBoxSuggestionsComponent<Bindings>
{
  public bindings!: SearchBoxSuggestionsBindings<SearchBox, Bindings>;
  private itemRenderingFunction: ItemRenderingFunction;
  private results: Result[] = [];
  private itemTemplateProvider!: ResultTemplateProvider;
  private instantResults!: InstantResults;
  private display: ItemDisplayLayout = 'list';

  @state() public error!: Error;
  @state() private templateHasError = false;

  /**
   * Sets a rendering function to bypass the standard HTML template mechanism for rendering results.
   * You can use this function while working with web frameworks that don't use plain HTML syntax such as React, Angular, or Vue.
   *
   * Do not use this method if you integrate Atomic in a plain HTML deployment.
   *
   * @param resultRenderingFunction
   */
  public async setRenderFunction(
    resultRenderingFunction: ItemRenderingFunction
  ) {
    this.itemRenderingFunction = resultRenderingFunction;
  }

  /**
   * The maximum number of results to show.
   */
  @property({attribute: 'max-results-per-query', reflect: true, type: Number})
  public maxResultsPerQuery = 4;

  /**
   * The spacing of various elements in the result list, including the gap between results, the gap between parts of a result, and the font sizes of different parts in a result.
   */
  @property({reflect: true}) public density: ItemDisplayDensity = 'normal';

  /**
   * The expected size of the image displayed in the results.
   */
  @property({attribute: 'image-size', reflect: true})
  public imageSize: ItemDisplayImageSize = 'icon';

  /**
   * The callback to generate an [`aria-label`](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Attributes/aria-label) for a given result so that accessibility tools can fully describe what's visually rendered by a result.
   *
   * By default, or if an empty string is returned, `result.title` is used.
   */
  @property({attribute: 'aria-label-generator'})
  public ariaLabelGenerator?: AriaLabelGenerator;

  connectedCallback() {
    super.connectedCallback();
    try {
      dispatchSearchBoxSuggestionsEvent<SearchBox, Bindings>(
        (bindings) => {
          this.bindings = bindings;
          return this.initialize();
        },
        this,
        ['atomic-search-box']
      );
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
          'instant-results-suggestion-label',
          this.ariaLabelGenerator?.(this.bindings, result) || result.title,
          result.uniqueId
        );
        const key = `instant-result-${encodeForDomAttribute(result.uniqueId)}`;

        const template = html`${keyed(
          key,
          html`<atomic-result
            part="outline"
            .result=${result}
            .interactiveResult=${buildInteractiveInstantResult(
              this.bindings.engine,
              {
                options: {result},
              }
            )}
            .display=${this.display}
            .density=${this.density}
            .imageSize=${this.imageSize}
            .content=${this.itemTemplateProvider.getTemplateContent(result)}
            .renderingFunction=${this.itemRenderingFunction}
          ></atomic-result>`
        )}`;

        const container = document.createElement('div');
        render(template, container);
        const resultElement = container.firstElementChild as HTMLElement;

        return {
          ...partialItem,
          content: resultElement,
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
        this.bindings.i18n,
        'show-all-results'
      );
      elements.push({
        ...partialItem,
        content: renderInstantItemShowAllButton({
          i18n: this.bindings.i18n,
          i18nKey: 'show-all-results',
        }),
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

    this.itemTemplateProvider = new ResultTemplateProvider({
      includeDefaultTemplate: true,
      templateElements: Array.from(
        this.querySelectorAll('atomic-result-template')
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
      position: Array.from(this.parentNode!.children).indexOf(this),
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

  @errorGuard()
  render() {
    return html`${nothing}`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'atomic-search-box-instant-results': AtomicSearchBoxInstantResults;
  }
}

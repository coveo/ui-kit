import {
  buildQuerySummary,
  buildResultList,
  type QuerySummary,
  type QuerySummaryState,
  type ResultList,
  type ResultListState,
} from '@coveo/headless';
import {html, LitElement, type PropertyValues} from 'lit';
import {customElement, state} from 'lit/decorators.js';
import {when} from 'lit/directives/when.js';
import {createAppLoadedListener} from '@/src/components/common/interface/store';
import {renderLoadMoreButton} from '@/src/components/common/load-more/button';
import {renderLoadMoreContainer} from '@/src/components/common/load-more/container';
import {renderLoadMoreProgressBar} from '@/src/components/common/load-more/progress-bar';
import {renderLoadMoreSummary} from '@/src/components/common/load-more/summary';
import {bindStateToController} from '@/src/decorators/bind-state';
import {bindingGuard} from '@/src/decorators/binding-guard';
import {bindings} from '@/src/decorators/bindings';
import {errorGuard} from '@/src/decorators/error-guard';
import type {InitializableComponent} from '@/src/decorators/types';
import {withTailwindStyles} from '@/src/decorators/with-tailwind-styles.js';
import {AriaLiveRegionController} from '@/src/utils/accessibility-utils';
import type {Bindings} from '../atomic-search-interface/atomic-search-interface';

/**
 * The `atomic-load-more-results` component allows the user to load additional results if more are available.
 *
 * @part container - The container of the component.
 * @part showing-results - The summary displaying which results are shown and how many are available.
 * @part highlight - The highlighted number of results displayed and number of results available.
 * @part progress-bar - The progress bar displaying a percentage of results shown over the total number of results available.
 * @part load-more-results-button - The "Load more results" button.
 *
 * @cssprop --atomic-more-results-progress-bar-color-from - Color of the start of the gradient for the load more results progress bar.
 * @cssprop --atomic-more-results-progress-bar-color-to - Color of the end of the gradient for the load more results progress bar.
 */
@customElement('atomic-load-more-results')
@bindings()
@withTailwindStyles
export class AtomicLoadMoreResults extends LitElement implements InitializableComponent<Bindings> {
  @state()
  public bindings!: Bindings;

  @state()
  public error!: Error;

  public querySummary!: QuerySummary;
  public resultList!: ResultList;

  @state()
  private isAppLoaded = false;

  @bindStateToController('querySummary')
  @state()
  private querySummaryState!: QuerySummaryState;

  @bindStateToController('resultList')
  @state()
  private resultListState!: ResultListState;

  private ariaMessage = new AriaLiveRegionController(this, 'load-more-results');

  public initialize() {
    this.querySummary = buildQuerySummary(this.bindings.engine);
    this.resultList = buildResultList(this.bindings.engine, {
      options: {
        fieldsToInclude: [],
      },
    });
    createAppLoadedListener(this.bindings.store, (isAppLoaded) => {
      this.isAppLoaded = isAppLoaded;
    });
  }

  @bindingGuard()
  @errorGuard()
  render() {
    return html`${when(this.shouldRender, () =>
      renderLoadMoreContainer()(html`
        ${renderLoadMoreSummary({
          props: {
            from: this.querySummaryState.lastResult,
            to: this.querySummaryState.total,
            i18n: this.bindings.i18n,
            label: 'showing-results-of-load-more',
          },
        })}
        ${renderLoadMoreProgressBar({
          props: {
            from: this.querySummaryState.lastResult,
            to: this.querySummaryState.total,
          },
        })}
        ${renderLoadMoreButton({
          props: {
            i18n: this.bindings.i18n,
            label: 'load-more-results',
            moreAvailable: this.resultListState.moreResultsAvailable,
            onClick: () => this.onClick(),
          },
        })}
      `)
    )}`;
  }

  protected updated(changedProperties: PropertyValues): void {
    super.updated(changedProperties);
    this.announceWhenAllResultsAreLoaded(changedProperties);
  }

  private async onClick() {
    this.bindings.store.state.resultList?.focusOnNextNewResult();
    this.resultList.fetchMoreResults();
  }

  /**
   * Announces, through an `aria-live` region, that the last available batch of
   * results has been loaded.
   *
   * Fetching more results keeps the same `searchResponseId`, which lets us
   * distinguish loading the last batch from a brand new search that happens to
   * have no more results available.
   */
  private announceWhenAllResultsAreLoaded(changedProperties: PropertyValues): void {
    if (!changedProperties.has('resultListState') || !this.resultListState) {
      return;
    }

    const previousState = changedProperties.get('resultListState') as ResultListState | undefined;

    const justLoadedLastBatch =
      previousState?.moreResultsAvailable === true &&
      !this.resultListState.moreResultsAvailable &&
      previousState.searchResponseId === this.resultListState.searchResponseId;

    if (justLoadedLastBatch) {
      this.ariaMessage.message = this.bindings.i18n.t('all-results-loaded');
    }
  }

  private get shouldRender() {
    return this.isAppLoaded && this.querySummaryState.hasResults;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'atomic-load-more-results': AtomicLoadMoreResults;
  }
}

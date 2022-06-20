import {
  buildHistoryManager,
  HistoryManager,
  HistoryManagerState,
  buildSearchStatus,
  SearchStatus,
  SearchStatusState,
  QuerySummary,
  QuerySummaryState,
  buildQuerySummary,
} from '@coveo/headless';
import {Component, h, Prop, State} from '@stencil/core';
import {
  Bindings,
  BindStateToController,
  InitializeBindings,
} from '../../../utils/initialization-utils';
import MagnifyingGlass from '../../../images/magnifying-glass.svg';
import escape from 'escape-html';
import {Button} from '../../common/button';
import {AriaLiveRegion} from '../../../utils/accessibility-utils';

/**
 * The `atomic-no-results` component displays search tips and a "Cancel last action" button when there are no results. Any additional content slotted inside of its element will be displayed as well.
 *
 * @part cancel-button - The "Cancel last action" button.
 * @part no-results - The text indicating that no results were found for the search.
 * @part search-tips - The search tips to help the user correct the query.
 * @part highlight - The highlighted query.
 * @part icon - The magnifying glass icon.
 */
@Component({
  tag: 'atomic-no-results',
  styleUrl: 'atomic-no-results.pcss',
  shadow: true,
})
export class AtomicNoResults {
  @InitializeBindings() public bindings!: Bindings;
  public searchStatus!: SearchStatus;
  public history!: HistoryManager;
  public querySummary!: QuerySummary;

  @BindStateToController('searchStatus')
  @State()
  private searchStatusState!: SearchStatusState;
  @BindStateToController('history')
  @State()
  private historyState!: HistoryManagerState;
  @BindStateToController('querySummary')
  @State()
  private querySummaryState!: QuerySummaryState;
  @State() public error!: Error;

  @AriaLiveRegion('no-results')
  protected ariaMessage!: string;

  /**
   * Whether to display a button which cancels the last available action.
   */
  @Prop({reflect: true}) enableCancelLastAction = true;

  public initialize() {
    this.searchStatus = buildSearchStatus(this.bindings.engine);
    this.history = buildHistoryManager(this.bindings.engine);
    this.querySummary = buildQuerySummary(this.bindings.engine);
  }

  private wrapHighlight(content: string) {
    return `<span class="font-bold" part="highlight">${this.bindings.i18n.t(
      'between-quotations',
      {text: escape(content), interpolation: {escapeValue: false}}
    )}</span>`;
  }

  private renderMagnifyingGlass() {
    return (
      <atomic-icon
        part="icon"
        icon={MagnifyingGlass}
        class="my-6 flex flex-col items-center w-1/2 max-w-lg"
      ></atomic-icon>
    );
  }

  private get summary() {
    return this.querySummaryState.hasQuery
      ? this.bindings.i18n.t('no-results-for', {
          interpolation: {escapeValue: false},
          query: this.querySummaryState.query,
        })
      : this.bindings.i18n.t('no-results');
  }

  private renderNoResults() {
    const content = this.querySummaryState.hasQuery
      ? this.bindings.i18n.t('no-results-for', {
          interpolation: {escapeValue: false},
          query: this.wrapHighlight(this.querySummaryState.query),
        })
      : this.bindings.i18n.t('no-results');
    return (
      // file deepcode ignore ReactSetInnerHtml: This is not React code.
      <div
        class="my-2 text-2xl font-medium"
        part="no-results"
        innerHTML={content}
      ></div>
    );
  }

  private renderSearchTips() {
    return (
      <div class="my-2 text-lg text-neutral-dark" part="search-tips">
        {this.bindings.i18n.t('search-tips')}
      </div>
    );
  }

  private renderCancel() {
    if (!this.historyState.past.length) {
      return;
    }

    return (
      <Button
        style="primary"
        part="cancel-button"
        text={this.bindings.i18n.t('cancel-last-action')}
        onClick={() => this.history.backOnNoResults()}
        class="font-bold px-2.5 py-3 my-3"
      ></Button>
    );
  }

  public render() {
    if (
      !this.searchStatusState.firstSearchExecuted ||
      this.searchStatusState.isLoading ||
      this.searchStatusState.hasResults
    ) {
      return;
    }

    this.ariaMessage = this.summary;

    return [
      <div class="flex flex-col items-center h-full w-full text-on-background">
        {this.renderMagnifyingGlass()}
        {this.renderNoResults()}
        {this.renderSearchTips()}
        {this.enableCancelLastAction && this.renderCancel()}
      </div>,
      <slot></slot>,
    ];
  }
}

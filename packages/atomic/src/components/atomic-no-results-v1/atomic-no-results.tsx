import {
  buildHistoryManager,
  HistoryManager,
  HistoryManagerState,
  buildSearchStatus,
  SearchStatus,
  SearchStatusState,
} from '@coveo/headless';
import {Component, h, Prop, State} from '@stencil/core';
import {
  Bindings,
  BindStateToController,
  InitializeBindings,
} from '../../utils/initialization-utils';
import Lupa from '../../images/lupa-frame.svg';

/**
 * The `atomic-no-results` component displays search tips and a "Cancel last action" button when there are no results. Any additional content slotted inside of its element will be displayed as well.
 *
 * @part cancel-button - The "Cancel last action" button.
 * @part highlight - The highlighted query.
 */
@Component({
  tag: 'atomic-no-results-v1', //TODO remove v1
  styleUrl: 'atomic-no-results.pcss',
  shadow: true,
})
export class AtomicNoResults {
  @InitializeBindings() public bindings!: Bindings;
  public searchStatus!: SearchStatus;
  public history!: HistoryManager;

  @BindStateToController('searchStatus')
  @State()
  private searchStatusState!: SearchStatusState;
  @BindStateToController('history')
  @State()
  private historyState!: HistoryManagerState;
  private strings = {
    noResults: () => {
      this.bindings.i18n.t('no-results-for-v1', {
        interpolation: {escapeValue: false},
        query: this.wrapHighlight(escape('query')), //TODO get query
      });
    },
    searchTips: () => this.bindings.i18n.t('search-tips-v1'),
    cancelLastAction: () => this.bindings.i18n.t('cancel-last-action'),
  };
  @State() public error!: Error;

  /**
   * Whether to display a button which cancels the last available action.
   */
  @Prop() enableCancelLastAction = true;

  public initialize() {
    this.searchStatus = buildSearchStatus(this.bindings.engine);
    this.history = buildHistoryManager(this.bindings.engine);
  }

  private wrapHighlight(content: string) {
    return `<span class="font-bold" part="highlight">${content}</span>`;
  }

  private renderLupa() {
    return <div innerHTML={Lupa} class="my-6"></div>;
  }

  private renderNoResultsMessage() {
    return (
      //classified as undefined
      <div class="my-2 text-2xl">{this.strings.noResults() + ''}</div>
    );
  }

  private renderSearchTips() {
    return (
      <div class="my-2 text-lg text-neutral-dark">
        {this.strings.searchTips()}
      </div>
    );
  }

  private renderCancel() {
    if (!this.historyState.past.length) {
      return;
    }

    return (
      <button
        part="cancel-button"
        class="text-neutral-light hover:underline font-bold bg-primary px-2.5 py-3 rounded-md my-2"
        onClick={() => this.history.back()}
      >
        {this.strings.cancelLastAction()}
      </button>
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

    return [
      <div class="flex flex-col items-center h-full w-full text-on-background">
        {this.renderLupa()}
        {this.renderNoResultsMessage()}
        {this.renderSearchTips()}
        {this.enableCancelLastAction && this.renderCancel()}
      </div>,
      <slot></slot>,
    ];
  }
}

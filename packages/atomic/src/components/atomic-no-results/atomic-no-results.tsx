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

/**
 * The `atomic-no-results` component displays search tips and a "Cancel last action" button when there are no results. Any additional content slotted inside of its element will be displayed as well.
 *
 * @part tips-title - The "Search tips" title.
 * @part tips-list - The tips list.
 * @part tips-list-element - The tips list elements.
 * @part cancel-button - The "Cancel last action" button.
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

  @BindStateToController('searchStatus')
  @State()
  private searchStatusState!: SearchStatusState;
  @BindStateToController('history')
  @State()
  private historyState!: HistoryManagerState;
  private strings = {
    cancelLastAction: () => this.bindings.i18n.t('cancel-last-action'),
    searchTips: () => this.bindings.i18n.t('search-tips'),
    checkSpelling: () => this.bindings.i18n.t('check-spelling'),
    tryUsingFewerKeywords: () =>
      this.bindings.i18n.t('try-using-fewer-keywords'),
    selectFewerFilters: () => this.bindings.i18n.t('select-fewer-filters'),
  };
  @State() public error!: Error;

  /**
   * Whether to display a button which cancels the last available action.
   */
  @Prop() enableCancelLastAction = true;
  /**
   * Whether to display a list of search tips to the user.
   */
  @Prop() enableSearchTips = true;

  public initialize() {
    this.searchStatus = buildSearchStatus(this.bindings.engine);
    this.history = buildHistoryManager(this.bindings.engine);
  }

  private renderCancel() {
    if (!this.historyState.past.length) {
      return;
    }

    return (
      <button
        part="cancel-button"
        class="text-primary hover:underline font-bold"
        onClick={() => this.history.back()}
      >
        {this.strings.cancelLastAction()}
      </button>
    );
  }

  private renderSearchTips() {
    return [
      <div part="tips-title" class="mt-2 text-lg">
        {this.strings.searchTips()}
      </div>,
      <ul part="tips-list" class="ml-5 list-disc list-inside">
        <li part="tips-list-element">{this.strings.checkSpelling()}</li>
        <li part="tips-list-element">{this.strings.tryUsingFewerKeywords()}</li>
        <li part="tips-list-element">{this.strings.selectFewerFilters()}</li>
      </ul>,
    ];
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
      <div class="text-on-background">
        {this.enableCancelLastAction && this.renderCancel()}
        {this.enableSearchTips && this.renderSearchTips()}
      </div>,
      <slot></slot>,
    ];
  }
}

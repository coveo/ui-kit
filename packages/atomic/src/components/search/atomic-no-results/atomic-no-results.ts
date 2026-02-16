import {
  buildHistoryManager,
  buildQuerySummary,
  buildSearchStatus,
  type HistoryManager,
  type HistoryManagerState,
  type QuerySummary,
  type QuerySummaryState,
  type SearchStatus,
  type SearchStatusState,
} from '@coveo/headless';
import {html, LitElement} from 'lit';
import {customElement, property, state} from 'lit/decorators.js';
import {renderCancel} from '@/src/components/common/no-items/cancel.js';
import {renderNoItemsContainer} from '@/src/components/common/no-items/container.js';
import {noItemsGuard} from '@/src/components/common/no-items/guard.js';
import {renderMagnifyingGlass} from '@/src/components/common/no-items/magnifying-glass.js';
import {renderNoItems} from '@/src/components/common/no-items/no-items.js';
import {renderSearchTips} from '@/src/components/common/no-items/tips.js';
import {getSummary} from '@/src/components/common/no-items/utils.js';
import type {Bindings} from '@/src/components/search/atomic-search-interface/atomic-search-interface.js';
import {booleanConverter} from '@/src/converters/boolean-converter';
import {bindStateToController} from '@/src/decorators/bind-state.js';
import {bindingGuard} from '@/src/decorators/binding-guard.js';
import {bindings} from '@/src/decorators/bindings.js';
import {errorGuard} from '@/src/decorators/error-guard.js';
import type {InitializableComponent} from '@/src/decorators/types.js';
import {withTailwindStyles} from '@/src/decorators/with-tailwind-styles.js';
import {AriaLiveRegionController} from '@/src/utils/accessibility-utils.js';

/**
 * The `atomic-no-results` component displays search tips and a "Cancel last action" button when there are no results. Any additional content slotted inside of its element will be displayed as well.
 *
 * @part cancel-button - The "Cancel last action" button.
 * @part no-results - The text indicating that no results were found for the search.
 * @part search-tips - The search tips to help the user correct the query.
 * @part highlight - The highlighted query.
 * @part icon - The magnifying glass icon.
 *
 * @slot default - Any additional content slotted inside of its element will be displayed as well.
 */
@customElement('atomic-no-results')
@bindings()
@withTailwindStyles
export class AtomicNoResults
  extends LitElement
  implements InitializableComponent<Bindings>
{
  // TODO - (v4) KIT-4823: Remove.
  /**
   * Whether to display a button which cancels the last available action.
   * @deprecated - replaced by `hide-cancel-last-action` (this defaults to `true`, while the replacement defaults to `false`).
   */
  @property({
    type: Boolean,
    reflect: true,
    attribute: 'enable-cancel-last-action',
    converter: booleanConverter,
  })
  enableCancelLastAction = true;

  /**
   * Whether to hide the button that would let the user cancel the action that yielded no results.
   */
  @property({
    type: Boolean,
    reflect: true,
    attribute: 'hide-cancel-last-action',
    useDefault: true,
  })
  hideCancelLastAction = false;

  @state()
  bindings!: Bindings;

  @state()
  public error!: Error;

  @bindStateToController('searchStatus')
  @state()
  private searchStatusState!: SearchStatusState;
  public searchStatus!: SearchStatus;

  @bindStateToController('history')
  @state()
  private historyState!: HistoryManagerState;
  public history!: HistoryManager;

  @bindStateToController('querySummary')
  @state()
  private querySummaryState!: QuerySummaryState;
  public querySummary!: QuerySummary;

  protected ariaMessage = new AriaLiveRegionController(this, 'no-results');

  public initialize() {
    this.searchStatus = buildSearchStatus(this.bindings.engine);
    this.history = buildHistoryManager(this.bindings.engine);
    this.querySummary = buildQuerySummary(this.bindings.engine);
  }

  @bindingGuard()
  @errorGuard()
  render() {
    const {
      bindings: {i18n},
    } = this;

    this.ariaMessage.message = getSummary(
      i18n,
      this.querySummaryState.query,
      this.searchStatusState.hasResults,
      'no-results'
    );

    return html`${noItemsGuard(
      {
        isLoading: this.searchStatusState.isLoading,
        firstSearchExecuted: this.searchStatusState.firstSearchExecuted,
        hasResults: this.searchStatusState.hasResults,
      },
      () =>
        renderNoItemsContainer()(html`
          ${renderMagnifyingGlass()}
          ${this.renderNoItems()}
          ${this.renderSearchTips()}
          ${this.renderCancelButton()}
        `)
    )}`;
  }

  private renderNoItems() {
    return renderNoItems({
      props: {
        query: this.querySummaryState.query,
        i18n: this.bindings.i18n,
        i18nKey: 'no-results',
      },
    });
  }

  private renderSearchTips() {
    return renderSearchTips({
      props: {
        i18n: this.bindings.i18n,
      },
    });
  }

  private renderCancelButton() {
    if (
      this.hideCancelLastAction ||
      !this.enableCancelLastAction ||
      !this.historyState.past.length
    ) {
      return null;
    }

    return renderCancel({
      props: {
        i18n: this.bindings.i18n,
        onClick: () => this.history.backOnNoResults(),
      },
    });
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'atomic-no-results': AtomicNoResults;
  }
}

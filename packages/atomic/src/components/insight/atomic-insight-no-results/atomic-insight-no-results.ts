import {
  buildQuerySummary,
  buildSearchStatus,
  type QuerySummary,
  type QuerySummaryState,
  type SearchStatus,
  type SearchStatusState,
} from '@coveo/headless/insight';
import {html, LitElement} from 'lit';
import {customElement, state} from 'lit/decorators.js';
import {bindStateToController} from '@/src/decorators/bind-state.js';
import {bindingGuard} from '@/src/decorators/binding-guard.js';
import {bindings} from '@/src/decorators/bindings.js';
import {errorGuard} from '@/src/decorators/error-guard.js';
import type {InitializableComponent} from '@/src/decorators/types.js';
import {withTailwindStyles} from '@/src/decorators/with-tailwind-styles.js';
import {AriaLiveRegionController} from '@/src/utils/accessibility-utils.js';
import {renderNoItemsContainer} from '../../common/no-items/container.js';
import {noItemsGuard} from '../../common/no-items/guard.js';
import {renderMagnifyingGlass} from '../../common/no-items/magnifying-glass.js';
import {renderNoItems} from '../../common/no-items/no-items.js';
import {renderSearchTips} from '../../common/no-items/tips.js';
import {getSummary} from '../../common/no-items/utils.js';
import type {InsightBindings} from '../atomic-insight-interface/atomic-insight-interface.js';

/**
 * The `atomic-insight-no-results` component displays search tips when there are no results. Any additional content slotted inside of its element will be displayed as well.
 *
 * @part no-results - The text indicating that no results were found for the search.
 * @part search-tips - The search tips to help the user correct the query.
 * @part highlight - The highlighted query.
 * @part icon - The magnifying glass icon.
 *
 * @slot default - Any additional content slotted inside of its element will be displayed as well.
 *
 * @internal
 */
@customElement('atomic-insight-no-results')
@bindings()
@withTailwindStyles
export class AtomicInsightNoResults
  extends LitElement
  implements InitializableComponent<InsightBindings>
{
  @state()
  bindings!: InsightBindings;

  public searchStatus!: SearchStatus;
  public querySummary!: QuerySummary;

  @bindStateToController('searchStatus')
  @state()
  public searchStatusState!: SearchStatusState;

  @bindStateToController('querySummary')
  @state()
  public querySummaryState!: QuerySummaryState;

  @state()
  public error!: Error;

  protected ariaMessage = new AriaLiveRegionController(this, 'no-results');

  public initialize() {
    this.searchStatus = buildSearchStatus(this.bindings.engine);
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
}

declare global {
  interface HTMLElementTagNameMap {
    'atomic-insight-no-results': AtomicInsightNoResults;
  }
}

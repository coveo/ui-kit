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
import {bindStateToController} from '@/src/decorators/bind-state';
import {bindingGuard} from '@/src/decorators/binding-guard.js';
import {bindings} from '@/src/decorators/bindings.js';
import {errorGuard} from '@/src/decorators/error-guard';
import type {InitializableComponent} from '@/src/decorators/types';
import {withTailwindStyles} from '@/src/decorators/with-tailwind-styles.js';
import {renderNoItemsContainer} from '../../common/no-items/container';
import {noItemsGuard} from '../../common/no-items/guard';
import {renderMagnifyingGlass} from '../../common/no-items/magnifying-glass';
import {renderNoItems} from '../../common/no-items/no-items';
import {renderSearchTips} from '../../common/no-items/tips';
import type {InsightBindings} from '../atomic-insight-interface/atomic-insight-interface';

/**
 * @internal
 */
@customElement('atomic-insight-no-results')
@bindings()
@withTailwindStyles
export class AtomicInsightNoResults
  extends LitElement
  implements InitializableComponent<InsightBindings>
{
  @state() bindings!: InsightBindings;
  public searchStatus!: SearchStatus;
  public querySummary!: QuerySummary;

  @bindStateToController('searchStatus')
  @state()
  private searchStatusState!: SearchStatusState;

  @bindStateToController('querySummary')
  @state()
  private querySummaryState!: QuerySummaryState;

  @state() public error!: Error;

  protected ariaMessage!: string;

  public initialize() {
    this.searchStatus = buildSearchStatus(this.bindings.engine);
    this.querySummary = buildQuerySummary(this.bindings.engine);
  }

  @errorGuard()
  @bindingGuard()
  render() {
    const {
      bindings: {i18n},
    } = this;

    return html`<div class="p-3 text-center">
      ${noItemsGuard(
        {
          firstSearchExecuted: this.searchStatusState.firstSearchExecuted,
          isLoading: this.searchStatusState.isLoading,
          hasResults: this.searchStatusState.hasResults,
        },
        () => html`
          ${renderNoItemsContainer()(html`
            ${renderMagnifyingGlass()}
            ${renderNoItems({
              props: {
                query: this.querySummaryState.query,
                i18n,
                i18nKey: 'no-results',
              },
            })}
            ${renderSearchTips({
              props: {
                i18n,
              },
            })}
          `)}
        `
      )}
    </div>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'atomic-insight-no-results': AtomicInsightNoResults;
  }
}

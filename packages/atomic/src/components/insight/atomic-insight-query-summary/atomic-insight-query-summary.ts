import {
  buildQuerySummary,
  type QuerySummary,
  type QuerySummaryState,
} from '@coveo/headless/insight';
import {type CSSResultGroup, css, html, LitElement} from 'lit';
import {customElement, state} from 'lit/decorators.js';
import {renderQuerySummaryContainer} from '@/src/components/common/query-summary/container';
import {renderQuerySummaryGuard} from '@/src/components/common/query-summary/guard';
import {getQuerySummaryI18nParameters} from '@/src/components/common/query-summary/utils';
import type {InsightBindings} from '@/src/components/insight/atomic-insight-interface/atomic-insight-interface';
import {bindStateToController} from '@/src/decorators/bind-state';
import {bindingGuard} from '@/src/decorators/binding-guard';
import {bindings} from '@/src/decorators/bindings';
import {errorGuard} from '@/src/decorators/error-guard';
import type {InitializableComponent} from '@/src/decorators/types';
import {withTailwindStyles} from '@/src/decorators/with-tailwind-styles';
import {localizedString} from '@/src/directives/localized-string';
import {InitializeBindingsMixin} from '@/src/mixins/bindings-mixin';
import {AriaLiveRegionController} from '@/src/utils/accessibility-utils';

/**
 * The `atomic-insight-query-summary` component displays information about the current range of results.
 * This component is used within the Insight Panel interface.
 *
 * @internal
 * @part container - The container for the whole summary.
 * @part highlight - The summary highlights.
 * @part query - The summary highlighted query.
 * @part placeholder - The query summary placeholder used while the search interface is initializing.
 */
@customElement('atomic-insight-query-summary')
@bindings()
@withTailwindStyles
export class AtomicInsightQuerySummary
  extends InitializeBindingsMixin(LitElement)
  implements InitializableComponent<InsightBindings>
{
  @state() public bindings!: InsightBindings;
  @state() public error!: Error;

  static styles: CSSResultGroup = [
    css`
      :host {
        overflow: hidden;
      }
    `,
  ];

  @bindStateToController('querySummary')
  @state()
  private querySummaryState!: QuerySummaryState;
  public querySummary!: QuerySummary;
  protected ariaMessage = new AriaLiveRegionController(this, 'query-summary');

  public initialize() {
    this.querySummary = buildQuerySummary(this.bindings.engine);
  }

  @bindingGuard()
  @errorGuard()
  render() {
    const {
      hasError,
      hasQuery,
      hasResults,
      firstSearchExecuted,
      firstResult,
      lastResult,
      isLoading,
      query,
      total,
    } = this.querySummaryState;

    const {ariaLiveMessage, highlights, i18nKey} =
      getQuerySummaryI18nParameters({
        first: firstResult,
        i18n: this.bindings.i18n,
        isLoading,
        last: lastResult,
        query,
        total,
      });

    this.ariaMessage.message = ariaLiveMessage;

    if (hasQuery) {
      return html`${renderQuerySummaryGuard({
        props: {
          firstSearchExecuted,
          hasResults,
          hasError,
        },
      })(html`
        ${renderQuerySummaryContainer({
          props: {additionalClasses: 'px-6 py-4'},
        })(html`
          ${localizedString({
            i18n: this.bindings.i18n,
            key: i18nKey,
            params: {
              first: html`${highlights.first}`,
              last: html`${highlights.last}`,
              total: html`${highlights.total}`,
              query: html`${highlights.query}`,
            },
            count: total,
          })}
        `)}
      `)}`;
    }

    if (hasError) {
      return html``;
    }

    return html`
      <div class="bg-[#F1F2FF] px-6 py-4 text-[#54698D] italic">
        ${this.bindings.i18n.t('insight-related-cases')}
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'atomic-insight-query-summary': AtomicInsightQuerySummary;
  }
}

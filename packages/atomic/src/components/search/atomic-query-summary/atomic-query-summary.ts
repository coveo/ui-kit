import {
  buildQuerySummary,
  type QuerySummary,
  type QuerySummaryState,
} from '@coveo/headless';
import {type CSSResultGroup, css, html, LitElement} from 'lit';
import {customElement, state} from 'lit/decorators.js';
import {bindStateToController} from '@/src/decorators/bind-state';
import {bindingGuard} from '@/src/decorators/binding-guard';
import {bindings} from '@/src/decorators/bindings';
import {errorGuard} from '@/src/decorators/error-guard';
import type {InitializableComponent} from '@/src/decorators/types';
import {withTailwindStyles} from '@/src/decorators/with-tailwind-styles.js';
import {localizedString} from '@/src/directives/localized-string';
import {InitializeBindingsMixin} from '@/src/mixins/bindings-mixin';
import {AriaLiveRegionController} from '@/src/utils/accessibility-utils';
import {renderQuerySummaryContainer} from '../../common/query-summary/container';
import {renderQuerySummaryGuard} from '../../common/query-summary/guard';
import {getQuerySummaryI18nParameters} from '../../common/query-summary/utils';
import type {Bindings} from '../atomic-search-interface/interfaces';

/**
 * The `atomic-query-summary` component displays information about the current range of results and the request duration (for example, "Results 1-10 of 123 in 0.47 seconds").
 *
 * @part container - The container for the whole summary.
 * @part duration - The container for the duration.
 * @part highlight - The summary highlights.
 * @part query - The summary highlighted query.
 * @part placeholder - The query summary placeholder used while the search interface is initializing.
 */
@customElement('atomic-query-summary')
@bindings()
@withTailwindStyles
export class AtomicQuerySummary
  extends InitializeBindingsMixin(LitElement)
  implements InitializableComponent<Bindings>
{
  @state() public bindings!: Bindings;
  @state() error!: Error;
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
      firstSearchExecuted,
      hasResults,
      hasError,
      total,
      firstResult,
      lastResult,
      query,
      durationInSeconds,
      isLoading,
    } = this.querySummaryState;

    const {i18nKey, highlights, ariaLiveMessage} =
      getQuerySummaryI18nParameters({
        first: firstResult,
        last: lastResult,
        query,
        total,
        i18n: this.bindings.i18n,
        isLoading,
      });

    this.ariaMessage.message = ariaLiveMessage;

    return html`${renderQuerySummaryGuard({
      props: {
        firstSearchExecuted,
        hasResults,
        hasError,
      },
    })(html`
      ${renderQuerySummaryContainer({props: {}})(html`
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
        <span class="hidden" part="duration">
          &nbsp;
          ${localizedString({
            i18n: this.bindings.i18n,
            key: 'in-seconds',
            params: {
              count: durationInSeconds.toLocaleString(
                this.bindings.i18n.language
              ),
            },
          })}
        </span>
      `)}
    `)}`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'atomic-query-summary': AtomicQuerySummary;
  }
}

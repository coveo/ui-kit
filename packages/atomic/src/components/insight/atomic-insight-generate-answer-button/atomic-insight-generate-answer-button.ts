import type {QuerySummary, QuerySummaryState} from '@coveo/headless/insight';
import {buildQuerySummary} from '@coveo/headless/insight';
import {html, LitElement} from 'lit';
import {customElement, property, state} from 'lit/decorators.js';
import {renderIconButton} from '@/src/components/common/icon-button';
import type {InsightBindings} from '@/src/components/insight/atomic-insight-interface/atomic-insight-interface';
import {bindStateToController} from '@/src/decorators/bind-state.js';
import {bindingGuard} from '@/src/decorators/binding-guard.js';
import {bindings} from '@/src/decorators/bindings.js';
import {errorGuard} from '@/src/decorators/error-guard';
import type {InitializableComponent} from '@/src/decorators/types';
import {withTailwindStyles} from '@/src/decorators/with-tailwind-styles.js';

/**
 * The atomic-insight-generate-answer-button component is an internal component made for builders preview.
 */
@customElement('atomic-insight-generate-answer-button')
@bindings()
@withTailwindStyles
export class AtomicInsightGenerateAnswerButton
  extends LitElement
  implements InitializableComponent<InsightBindings>
{
  @state() bindings!: InsightBindings;
  @state() error!: Error;

  public querySummary!: QuerySummary;

  @bindStateToController('querySummary')
  @state()
  private querySummaryState!: QuerySummaryState;

  /**
   * The tooltip text for the generate answer button.
   */
  @property({type: String, attribute: 'tooltip'}) tooltip = 'Generate Answer';

  public initialize() {
    this.querySummary = buildQuerySummary(this.bindings.engine);
  }

  @errorGuard()
  @bindingGuard()
  render() {
    const {hasQuery, total} = this.querySummaryState;

    if (hasQuery || total === 0) {
      return html``;
    }

    return html`
      ${renderIconButton({
        props: {
          partPrefix: 'generate-answer',
          style: 'primary',
          icon: 'assets://sparkles.svg',
          ariaLabel: this.tooltip,
          title: this.tooltip,
        },
      })}
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'atomic-insight-generate-answer-button': AtomicInsightGenerateAnswerButton;
  }
}

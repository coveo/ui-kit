import {html, LitElement} from 'lit';
import {customElement, property, state} from 'lit/decorators.js';
import {renderIconButton} from '@/src/components/common/icon-button';
import type {InsightBindings} from '@/src/components/insight/atomic-insight-interface/atomic-insight-interface';
import {bindingGuard} from '@/src/decorators/binding-guard.js';
import {bindings} from '@/src/decorators/bindings.js';
import {errorGuard} from '@/src/decorators/error-guard';
import type {InitializableComponent} from '@/src/decorators/types';
import {withTailwindStyles} from '@/src/decorators/with-tailwind-styles.js';
import SparklesIcon from '@/src/images/sparkles.svg';

/**
 * The atomic-insight-generate-answer-button component is an internal component made for builders preview.
 * @internal
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

  /**
   * The tooltip text for the generate answer button.
   */
  @property({type: String, attribute: 'tooltip'}) tooltip = 'Generate Answer';

  public initialize() {
    // No specific initialization needed for this placeholder component.
  }

  @errorGuard()
  @bindingGuard()
  render() {
    return html`
      ${renderIconButton({
        props: {
          partPrefix: 'generate-answer',
          style: 'primary',
          icon: SparklesIcon,
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

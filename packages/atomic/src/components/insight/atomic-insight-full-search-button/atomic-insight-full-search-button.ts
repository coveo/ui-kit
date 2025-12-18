import {html, LitElement} from 'lit';
import {customElement, property, state} from 'lit/decorators.js';
import {renderIconButton} from '@/src/components/common/icon-button';
import type {InsightBindings} from '@/src/components/insight/atomic-insight-interface/atomic-insight-interface';
import {bindingGuard} from '@/src/decorators/binding-guard.js';
import {bindings} from '@/src/decorators/bindings.js';
import {errorGuard} from '@/src/decorators/error-guard';
import type {InitializableComponent} from '@/src/decorators/types';
import {withTailwindStyles} from '@/src/decorators/with-tailwind-styles.js';
import styles from './atomic-insight-full-search-button.tw.css';

/**
 * The `atomic-insight-full-search-button` component is an internal button that links to the full search interface.
 *
 * @internal
 * @part full-search-container - The container wrapper for the button.
 * @part full-search-button - The button element.
 * @part full-search-icon - The icon within the button.
 */
@customElement('atomic-insight-full-search-button')
@bindings()
@withTailwindStyles
export class AtomicInsightFullSearchButton
  extends LitElement
  implements InitializableComponent<InsightBindings>
{
  static styles = styles;

  @state() bindings!: InsightBindings;
  @state() error!: Error;

  /**
   * The tooltip text for the full search button.
   */
  @property({type: String, attribute: 'tooltip'}) tooltip = '';

  public initialize() {
    // This component doesn't require any controllers
  }

  @errorGuard()
  @bindingGuard()
  render() {
    return html`
      ${renderIconButton({
        props: {
          partPrefix: 'full-search',
          style: 'outline-neutral',
          icon: 'assets://arrow-full.svg',
          ariaLabel: this.bindings.i18n.t('full-search'),
          title: this.tooltip,
        },
      })}
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'atomic-insight-full-search-button': AtomicInsightFullSearchButton;
  }
}

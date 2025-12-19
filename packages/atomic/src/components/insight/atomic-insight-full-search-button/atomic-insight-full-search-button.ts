import {css, html, LitElement} from 'lit';
import {customElement, property, state} from 'lit/decorators.js';
import {renderIconButton} from '@/src/components/common/icon-button';
import type {InsightBindings} from '@/src/components/insight/atomic-insight-interface/atomic-insight-interface';
import {bindingGuard} from '@/src/decorators/binding-guard.js';
import {bindings} from '@/src/decorators/bindings.js';
import {errorGuard} from '@/src/decorators/error-guard';
import type {InitializableComponent} from '@/src/decorators/types';
import {withTailwindStyles} from '@/src/decorators/with-tailwind-styles.js';
import ArrowFull from '../../../images/arrow-full.svg';

/**
 * The `atomic-insight-full-search-button` component is an internal button that links to the full search interface.
 *
 * @part full-search-container - The container wrapper for the button.
 * @part full-search-button - The button element.
 * @part full-search-icon - The icon within the button.
 *
 * @cssprop --full-search-background-color - The background color of the button.
 * @cssprop --full-search-secondary-background-color - The background color of the button on hover.
 */
@customElement('atomic-insight-full-search-button')
@bindings()
@withTailwindStyles
export class AtomicInsightFullSearchButton
  extends LitElement
  implements InitializableComponent<InsightBindings>
{
  static styles = css`
   @reference '../../../utils/tailwind.global.tw.css';

  :host {
    @apply absolute right-0;
    --full-search-background-color: var(--atomic-neutral-dark);
    --full-search-secondary-background-color: #333536;
  }

  :host::part(full-search-button) {
    @apply size-[27px] rounded-none border-none;
    background-color: var(--full-search-background-color);
    clip-path: polygon(0 0, 100% 100%, 100% 0);
  }

  :host::part(full-search-button):hover {
    background-color: var(--full-search-secondary-background-color);
    border-color: var(--full-search-secondary-background-color);
  }

  :host::part(full-search-icon) {
    @apply absolute top-[4px] left-[15px] h-[9px] w-[9px];
  }
  `;

  @state() bindings!: InsightBindings;
  @state() error!: Error;

  /**
   * The tooltip text for the full search button.
   */
  @property({type: String, attribute: 'tooltip'}) tooltip = '';

  public initialize() {}

  @errorGuard()
  @bindingGuard()
  render() {
    return html`
      ${renderIconButton({
        props: {
          partPrefix: 'full-search',
          style: 'outline-neutral',
          icon: ArrowFull,
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

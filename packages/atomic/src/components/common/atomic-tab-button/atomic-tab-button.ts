import {html, LitElement, type PropertyValues} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import {renderButton} from '@/src/components/common/button';
import {errorGuard} from '@/src/decorators/error-guard';
import type {LitElementWithError} from '@/src/decorators/types';
import {withTailwindStyles} from '@/src/decorators/with-tailwind-styles';

/**
 * The `atomic-tab-button` component renders a tab button for use in tab interfaces.
 *
 * @internal
 * @part button-container - The container for the tab button when inactive.
 * @part button-container-active - The container for the tab button when active.
 * @part tab-button - The tab button itself when inactive.
 * @part tab-button-active - The tab button itself when active.
 */
@customElement('atomic-tab-button')
@withTailwindStyles
export class AtomicTabButton extends LitElement implements LitElementWithError {
  error!: Error;
  /**
   * The label to display on the tab button.
   */
  @property({type: String}) label!: string;

  /**
   * Whether the tab button is active.
   */
  @property({type: Boolean}) active = false;

  /**
   * A click handler for the tab button.
   */
  @property({attribute: false}) select!: () => void;

  connectedCallback() {
    super.connectedCallback();
    this.setAttribute('role', 'listitem');
    this.updateHostClasses();
  }

  updated(changedProperties: PropertyValues<this>) {
    if (changedProperties.has('active')) {
      this.setAttribute('aria-current', this.active ? 'true' : 'false');
      this.updateHostClasses();
    }
  }

  private updateHostClasses() {
    this.classList.toggle('relative', this.active);
    this.classList.toggle('after:block', this.active);
    this.classList.toggle('after:w-full', this.active);
    this.classList.toggle('after:h-1', this.active);
    this.classList.toggle('after:absolute', this.active);
    this.classList.toggle('after:-bottom-0.5', this.active);
    this.classList.toggle('after:bg-primary', this.active);
    this.classList.toggle('after:rounded', this.active);
  }

  @errorGuard()
  render() {
    const buttonClasses = [
      'w-full',
      'truncate',
      'px-2',
      'pb-1',
      'text-xl',
      'sm:px-6',
      'hover:text-primary',
      !this.active && 'text-neutral-dark',
    ]
      .filter(Boolean)
      .join(' ');

    return html`
      ${renderButton({
        props: {
          style: 'text-transparent',
          class: buttonClasses,
          part: this.active ? 'tab-button-active' : 'tab-button',
          onClick: this.select,
        },
      })(html`${this.label}`)}
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'atomic-tab-button': AtomicTabButton;
  }
}

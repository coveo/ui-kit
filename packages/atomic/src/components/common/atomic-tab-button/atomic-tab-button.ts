import {html, LitElement, type PropertyValues} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import {errorGuard} from '@/src/decorators/error-guard';
import type {LitElementWithError} from '@/src/decorators/types';
import {withTailwindStyles} from '@/src/decorators/with-tailwind-styles';
import {LightDomMixin} from '@/src/mixins/light-dom';

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
export class AtomicTabButton
  extends LightDomMixin(LitElement)
  implements LitElementWithError
{
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
    this.addEventListener('click', this.handleClick);
    this.addEventListener('keydown', this.handleKeydown);
    this.updateHostAttributes();
    this.updateHostClasses();
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.removeEventListener('click', this.handleClick);
    this.removeEventListener('keydown', this.handleKeydown);
  }

  updated(changedProperties: PropertyValues<this>) {
    if (changedProperties.has('active')) {
      this.updateHostAttributes();
      this.updateHostClasses();
    }
  }

  private handleClick = () => {
    this.select();
  };

  private handleKeydown = (event: KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      this.select();
    }
  };

  private updateHostAttributes() {
    this.setAttribute('role', 'tab');
    this.setAttribute('aria-selected', this.active ? 'true' : 'false');
    this.setAttribute(
      'part',
      this.active ? 'button-container-active' : 'button-container'
    );
    this.tabIndex = this.active ? 0 : -1;
  }

  private updateHostClasses() {
    this.classList.add(
      'cursor-pointer',
      'hover:text-primary',
      'focus-visible:text-primary',
      'focus-visible:outline-none'
    );
    this.classList.toggle('text-on-background', this.active);
    this.classList.toggle('text-neutral-dark', !this.active);
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
      'relative',
      'inline-block',
      'overflow-hidden',
      'w-full',
      'truncate',
      'px-2',
      'pb-1',
      'text-xl',
      'sm:px-6',
    ]
      .filter(Boolean)
      .join(' ');

    return html`
      <span
        class=${buttonClasses}
        part=${this.active ? 'tab-button-active' : 'tab-button'}
      >
        ${this.label}
      </span>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'atomic-tab-button': AtomicTabButton;
  }
}

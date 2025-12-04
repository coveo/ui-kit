import {html, LitElement} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import {renderButton} from '@/src/components/common/button';
import {errorGuard} from '@/src/decorators/error-guard';
import type {LitElementWithError} from '@/src/decorators/types';
import {withTailwindStyles} from '@/src/decorators/with-tailwind-styles';
import {multiClassMap, tw} from '@/src/directives/multi-class-map';

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

  @errorGuard()
  render() {
    const containerClasses = tw({
      relative: this.active,
      'after:block': this.active,
      'after:w-full': this.active,
      'after:h-1': this.active,
      'after:absolute': this.active,
      'after:-bottom-0.5': this.active,
      'after:bg-primary': this.active,
      'after:rounded': this.active,
    });

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
      <div
        role="listitem"
        class=${multiClassMap(containerClasses)}
        aria-current=${this.active ? 'true' : 'false'}
        part=${this.active ? 'button-container-active' : 'button-container'}
      >
        ${renderButton({
          props: {
            style: 'text-transparent',
            class: buttonClasses,
            part: this.active ? 'tab-button-active' : 'tab-button',
            onClick: this.select,
          },
        })(html`${this.label}`)}
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'atomic-tab-button': AtomicTabButton;
  }
}

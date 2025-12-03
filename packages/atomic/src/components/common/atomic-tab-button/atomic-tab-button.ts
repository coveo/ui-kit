import {html, LitElement} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import {classMap} from 'lit/directives/class-map.js';
import {renderButton} from '@/src/components/common/button';
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
export class AtomicTabButton extends LitElement {
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

  render() {
    const containerClasses = {
      relative: this.active,
      'after:block': this.active,
      'after:w-full': this.active,
      'after:h-1': this.active,
      'after:absolute': this.active,
      'after:-bottom-0.5': this.active,
      'after:bg-primary': this.active,
      'after:rounded': this.active,
    };

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
        class=${classMap(containerClasses)}
        aria-current=${this.active ? 'true' : 'false'}
        aria-label=${`tab for ${this.label}`}
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

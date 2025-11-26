import {html, LitElement} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import {renderButton} from '@/src/components/common/button';

/**
 * The `atomic-tab-button` component is an internal tab button element.
 * @internal
 *
 * @part button-container - The container wrapping the button
 * @part button-container-active - The container when the button is active
 * @part tab-button - The button element
 * @part tab-button-active - The button element when active
 */
@customElement('atomic-tab-button')
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
   * Click handler for the tab button.
   */
  @property({attribute: false}) select!: () => void;

  private get activeTabClass() {
    return this.active
      ? 'relative after:block after:w-full after:h-1 after:absolute after:-bottom-0.5 after:bg-primary after:rounded'
      : '';
  }

  private get activeTabTextClass() {
    return this.active ? '' : 'text-neutral-dark';
  }

  connectedCallback() {
    super.connectedCallback();
    this.setAttribute('role', 'listitem');
    this.setAttribute('aria-current', this.active ? 'true' : 'false');
    this.setAttribute('aria-label', `tab for ${this.label}`);
    this.setAttribute(
      'part',
      `button-container${this.active ? '-active' : ''}`
    );
  }

  updated(changedProperties: Map<string, unknown>) {
    super.updated(changedProperties);
    if (changedProperties.has('active')) {
      this.setAttribute('aria-current', this.active ? 'true' : 'false');
      this.setAttribute(
        'part',
        `button-container${this.active ? '-active' : ''}`
      );
      this.className = this.activeTabClass;
    }
    if (changedProperties.has('label')) {
      this.setAttribute('aria-label', `tab for ${this.label}`);
    }
  }

  render() {
    return renderButton({
      props: {
        style: 'text-transparent',
        onClick: this.select,
        class: `w-full truncate px-2 pb-1 text-xl sm:px-6 hover:text-primary ${this.activeTabTextClass}`,
        part: `tab-button${this.active ? '-active' : ''}`,
      },
    })(html`${this.label}`);
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'atomic-tab-button': AtomicTabButton;
  }
}

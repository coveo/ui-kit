import {TailwindLitElement} from '@/src/utils/tailwind.element';
import {html} from 'lit';
import {customElement, property} from 'lit/decorators.js';

/**
 * The `atomic-component-error` component is used by other components to render and log errors.
 */
@customElement('atomic-component-error')
export class AtomicComponentError extends TailwindLitElement {
  @property({type: Object}) element!: HTMLElement;
  @property({type: Object}) error!: Error;

  connectedCallback() {
    super.connectedCallback();
    console.error(this.error, this.element);
  }

  render() {
    return html`
      <div class="text-error">
        <p>
          <b>${this.element.nodeName.toLowerCase()} component error</b>
        </p>
        <p>Look at the developer console for more information.</p>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'atomic-component-error': AtomicComponentError;
  }
}

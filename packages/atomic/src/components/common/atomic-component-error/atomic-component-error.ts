import {html, LitElement} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import {withTailwindStyles} from '@/src/decorators/with-tailwind-styles';

/**
 * The `atomic-component-error` component is used by other components to render and log errors.
 */
@customElement('atomic-component-error')
@withTailwindStyles
export class AtomicComponentError extends LitElement {
  @property({type: Object}) element!: HTMLElement;
  @property({type: Object}) error!: Error;

  firstUpdated() {
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

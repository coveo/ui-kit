import {html} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import {TailwindLitElement} from '../../utils/tailwind.element.js';

@customElement('atomic-sunbeam-tooltip')
export class AtomicSunbeamTooltip extends TailwindLitElement {
  @property({type: String}) message = '';

  render() {
    return html`
      <div class="group relative">
        <div
          class="transform animate-pulse rounded-md bg-yellow-400 p-2 text-white shadow-lg group-hover:block"
        >
          ${this.message}
        </div>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'atomic-sunbeam-tooltip': AtomicSunbeamTooltip;
  }
}

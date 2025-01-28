import {html} from 'lit';
import {customElement} from 'lit/decorators.js';
import {TailwindLitElement} from '../../utils/tailwind.element.js';

@customElement('atomic-leafy-card')
export class AtomicLeafyCard extends TailwindLitElement {
  render() {
    return html`
      <div
        class="relative rounded-lg border-2 border-green-400 bg-green-100 p-4 shadow-md"
      >
        <div
          class="absolute -left-4 -top-4 h-12 w-12 animate-pulse rounded-full bg-green-300"
        ></div>
        <div class="text-gray-800"><slot></slot></div>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'atomic-leafy-card': AtomicLeafyCard;
  }
}

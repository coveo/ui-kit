import {html} from 'lit';
import {customElement} from 'lit/decorators.js';
import {TailwindLitElement} from '../../utils/tailwind.element.js';
import '../atomic-firefly-icon/atomic-firefly-icon.js';

@customElement('atomic-butterfly-carousel')
export class AtomicButterflyCarousel extends TailwindLitElement {
  render() {
    return html`
      <div class="relative h-64 w-64 overflow-hidden">
        <div class="animate-slide flex space-x-4">
          <div class="h-64 w-64 rounded-lg bg-blue-300">
            <atomic-firefly-icon></atomic-firefly-icon>
          </div>
          <div class="h-64 w-64 rounded-lg bg-green-300">
            <atomic-firefly-icon></atomic-firefly-icon>
          </div>
          <div class="h-64 w-64 rounded-lg bg-purple-300">
            <atomic-firefly-icon></atomic-firefly-icon>
          </div>
        </div>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'atomic-butterfly-carousel': AtomicButterflyCarousel;
  }
}

import {html} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import {TailwindLitElement} from '../../utils/tailwind.element.js';

@customElement('atomic-dewdrop-slider')
export class AtomicDewdropSlider extends TailwindLitElement {
  @property({type: Number}) value = 50;

  render() {
    return html`
      <div class="flex items-center space-x-4">
        <input
          type="range"
          class="slider-thumb h-2 w-full appearance-none rounded-lg bg-blue-300"
          .value="${this.value}"
        />
        <div
          class="relative flex h-6 w-6 animate-bounce items-center justify-center rounded-full bg-blue-400 text-white shadow-md"
        >
          💧
        </div>
        <span class="text-blue-600">${this.value}%</span>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'atomic-dewdrop-slider': AtomicDewdropSlider;
  }
}

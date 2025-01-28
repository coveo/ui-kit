import {html} from 'lit';
import {customElement} from 'lit/decorators.js';
import {TailwindLitElement} from '../../utils/tailwind.element.js';

@customElement('atomic-blossom-button')
export class AtomicBlossomButton extends TailwindLitElement {
  render() {
    return html`
      <button
        class="relative rounded-full bg-pink-500 px-4 py-2 text-white shadow-lg hover:bg-pink-600 focus:outline-none focus:ring-4 focus:ring-pink-300"
      >
        <span
          class="absolute inset-0 flex items-center justify-center text-lg font-bold"
        >
          🌸
        </span>
        <slot></slot>
      </button>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'atomic-blossom-button': AtomicBlossomButton;
  }
}

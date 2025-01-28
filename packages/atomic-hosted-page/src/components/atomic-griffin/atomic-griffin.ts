import {html, LitElement} from 'lit';
import {customElement, property} from 'lit/decorators.js';

declare global {
  interface HTMLElementTagNameMap {
    'atomic-griffin': AtomicGriffin;
  }
}

@customElement('atomic-griffin')
export class AtomicGriffin extends LitElement {
  static styles = [
    // Add Tailwind utility classes here (requires Tailwind setup in your project)
  ];

  @property({type: String})
  name = 'Griffin';

  render() {
    return html`
      <div
        class="flex flex-col items-center justify-center rounded-xl border-2 border-yellow-500 bg-gradient-to-b from-yellow-50 to-yellow-100 p-4 shadow-xl"
      >
        <div class="relative h-32 w-32">
          <!-- Griffin body -->
          <div
            class="absolute inset-0 flex animate-bounce items-center justify-center rounded-full border-4 border-yellow-600 bg-yellow-500 hover:animate-spin"
          >
            <span class="text-4xl font-bold text-white">🦅</span>
          </div>
          <!-- Griffin wings -->
          <div
            class="absolute left-[-10px] top-0 h-8 w-8 rotate-45 animate-pulse rounded-full bg-yellow-400"
          ></div>
          <div
            class="absolute right-[-10px] top-0 h-8 w-8 rotate-45 animate-pulse rounded-full bg-yellow-400"
          ></div>
        </div>
        <h2 class="mt-4 text-lg font-semibold text-yellow-600">${this.name}</h2>
        <slot></slot>
      </div>
    `;
  }
}

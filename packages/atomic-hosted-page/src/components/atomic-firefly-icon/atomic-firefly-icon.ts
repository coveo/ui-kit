import {html} from 'lit';
import {customElement} from 'lit/decorators.js';
import {TailwindLitElement} from '../../utils/tailwind.element.js';

@customElement('atomic-firefly-icon')
export class AtomicFireflyIcon extends TailwindLitElement {
  render() {
    return html`
      <div class="relative">
        <div
          class="absolute h-3 w-3 animate-ping rounded-full bg-yellow-400 opacity-75"
        ></div>
        <div class="h-5 w-5 rounded-full bg-yellow-500"></div>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'atomic-firefly-icon': AtomicFireflyIcon;
  }
}

import {html} from 'lit';
import {customElement} from 'lit/decorators.js';
import {TailwindLitElement} from '../../utils/tailwind.element.js';

@customElement('atomic-breezy-navbar')
export class AtomicBreezyNavbar extends TailwindLitElement {
  render() {
    return html`
      <nav class="flex items-center justify-between bg-blue-500 p-4 shadow-md">
        <div class="text-xl font-semibold text-white">Whimsical Nature</div>
        <div class="space-x-4">
          <a href="#" class="text-white hover:text-yellow-300">Home</a>
          <a href="#" class="text-white hover:text-yellow-300">About</a>
          <a href="#" class="text-white hover:text-yellow-300">Contact</a>
        </div>
      </nav>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'atomic-breezy-navbar': AtomicBreezyNavbar;
  }
}

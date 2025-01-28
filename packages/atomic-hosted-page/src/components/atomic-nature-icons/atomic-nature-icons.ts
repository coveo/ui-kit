import {html} from 'lit';
import {customElement} from 'lit/decorators.js';
import {unsafeHTML} from 'lit/directives/unsafe-html.js';
import Add from '../../images/add.svg';
import ArrowBottom from '../../images/arrow-bottom-rounded.svg';
import ArrowTop from '../../images/arrow-top-rounded.svg';
import {TailwindLitElement} from '../../utils/tailwind.element.js';

@customElement('atomic-nature-icons')
export class AtomicNatureIcons extends TailwindLitElement {
  render() {
    return html`
      <div class="relative h-64 w-64">
        ${unsafeHTML(Add)}${unsafeHTML(ArrowBottom)}${unsafeHTML(ArrowTop)}
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'atomic-nature-icons': AtomicNatureIcons;
  }
}

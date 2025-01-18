import {LitElement, html, css} from 'lit';
import {customElement, property} from 'lit/decorators.js';

@customElement('atomic-result-example-component')
export class AtomicResultExampleComponent extends LitElement {
  @property({type: String}) name = 'World';

  static styles = css`
    :host {
      display: block;
      padding: 16px;
    }
  `;

  render() {
    return html`
      <div>
        <p>Hello, ${this.name}!</p>
      </div>
    `;
  }

  whatsMyName() {
    return this.name;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'atomic-result-example-component': AtomicResultExampleComponent;
  }
}

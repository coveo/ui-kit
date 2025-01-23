import {LitElement, html} from 'lit';
import {customElement, property, state} from 'lit/decorators.js';

@customElement('atomic-dummy')
export class AtomicDummy extends LitElement {
  @property({type: String}) message: string = 'Hello, World!';
  @state() private text = 'default';

  public test() {
    console.log('other method');
    // this.text = this.message;
  }

  public onMessageChange() {
    console.log('changed from');
    this.text = this.message;
  }

  public onClick() {
    const random = Math.random().toString().slice(0, 5);
    console.log(random);
    this.message = 'Hello, Universe!' + random;
  }

  render() {
    return html`
      <button @click=${this.onClick}>
        <p>${this.text}</p>
      </button>
    `;
  }
}

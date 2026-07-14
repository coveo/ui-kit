import {html, LitElement} from 'lit';
import {customElement} from 'lit/decorators/custom-element.js';
import {css} from 'lit';

@customElement('atomic-silly-button')
export class AtomicSillyButton extends LitElement {
  static firstHoverStylesheet = css`
    button:hover {
      background-color: #5945a0;
    }
  `;
  static secondHoverStylesheet = css`
    button:hover {
      background-color: #ff0000;
    }
  `;
  static styles = [
    css`
      button {
        background-color: #4caf50;
      }
    `,
    AtomicSillyButton.firstHoverStylesheet,
  ];
  #fuse = false;
  handleClick() {
    if (this.#fuse) return;
    this.#fuse = true;
    this.shadowRoot!.adoptedStyleSheets.splice(
      1,
      1,
      AtomicSillyButton.secondHoverStylesheet.styleSheet!
    );
    console.log('stylesheets mutated');
  }

  render() {
    return html`<button @click=${this.handleClick}>Click me!</button>`;
  }
}

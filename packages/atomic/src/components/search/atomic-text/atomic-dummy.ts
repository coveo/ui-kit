import {html, css, CSSResultGroup, unsafeCSS} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import {TailwindLitElement} from '../../../utils/tailwind.element';
import styles from './atomic-text.styles.tw.css';

@customElement('atomic-dummy')
export class AtomicDummy extends TailwindLitElement {
  @property({type: String}) name = 'World';

  static styles: CSSResultGroup = [
    TailwindLitElement.styles,
    css`
      div {
        border-radius: var(--atomic-border-radius-xl);
      }
    `,
    unsafeCSS(styles),
  ];

  render() {
    return html`<p>Hello, ${this.name}!</p>`;
  }
}

import {CSSResultGroup, LitElement, unsafeCSS} from 'lit';
import theme from './coveo.tw.css.js';
import styles from './tailwind.global.tw.css.js';

export class TailwindLitElement extends LitElement {
  static styles: CSSResultGroup = [unsafeCSS(theme), unsafeCSS(styles)];
}

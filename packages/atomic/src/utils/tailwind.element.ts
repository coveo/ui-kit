import {CSSResultGroup, LitElement, unsafeCSS, css} from 'lit';
import theme from './coveo.tw.css';
import utilities from './tailwind-utilities/utilities.tw.css';
import styles from './tailwind.global.tw.css';

export class TailwindLitElement extends LitElement {
  static styles: CSSResultGroup = [
    css`
      @layer base,utilities, components;
    `,
    unsafeCSS(theme),
    unsafeCSS(styles),
    unsafeCSS(utilities),
  ];
}

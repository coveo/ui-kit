import {withTailwindStyles} from '@/src/decorators/with-tailwind-styles.js';
import {CSSResultGroup, html, LitElement, unsafeCSS} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import ArrowLeftIcon from '../../../images/arrow-left-rounded.svg';
import {button} from '../../common/button';
import styles from './atomic-bla.tw.css';

/**
 * The atomic-bla is a component that does something.
 */
@customElement('atomic-bla')
@withTailwindStyles
export class AtomicBla extends LitElement {
  static styles: CSSResultGroup = [unsafeCSS(styles)];

  /**
   * The name of the atomic-bla
   */
  @property() name = 'World';

  render() {
    return html`<div>
      <h1>atomic-bla</h1>
      <p>Hello ${this.name}</p>
      ${button({
        props: {
          style: 'outline-primary',
          class: 'flex min-h-10 min-w-10 items-center justify-center p-1',
        },
        children: html`<atomic-icon
          icon="${ArrowLeftIcon}"
          part="next-button-icon"
          class="w-5 align-middle"
        ></atomic-icon>`,
      })}
      ${button({
        props: {
          style: 'outline-primary',
          class: 'flex min-h-10 min-w-10 items-center justify-center p-1',
        },
        children: html`<label class="w-5 align-middle"
          ><span>Hello</span></label
        >`,
      })}
      ${button({
        props: {
          style: 'text-transparent',
          class:
            'flex w-full justify-between rounded-none px-2 py-1 text-lg font-bold',
        },
        children: html`<label class="w-5 align-middle"
          ><span>world</span></label
        >`,
      })}
    </div>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'atomic-bla': AtomicBla;
  }
}

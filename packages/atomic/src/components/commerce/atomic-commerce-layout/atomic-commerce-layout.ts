import {html, LitElement, unsafeCSS} from 'lit';
import {customElement, property, state} from 'lit/decorators.js';
import {errorGuard} from '@/src/decorators/error-guard';
import {injectStylesForNoShadowDOM} from '@/src/decorators/inject-styles-for-no-shadow-dom';
import {randomID} from '@/src/utils/utils';
import {DEFAULT_MOBILE_BREAKPOINT} from '../../../utils/replace-breakpoint';
import styles from './atomic-commerce-layout.tw.css';
import {buildCommerceLayout} from './commerce-layout';

/**
 * The `atomic-commerce-layout` helps organize elements in the commerce page.
 *
 * @slot default - The default slot where you can add child components to the layout.
 */
@customElement('atomic-commerce-layout')
@injectStylesForNoShadowDOM
export class AtomicCommerceLayout extends LitElement {
  static styles = [styles];
  @state() error!: Error;

  constructor() {
    super();
    this.id = randomID('atomic-commerce-layout-');
  }

  /**
   * CSS value that defines where the layout goes from mobile to desktop.
   * e.g., 800px, 65rem.
   */
  @property({type: String, reflect: true, attribute: 'mobile-breakpoint'})
  mobileBreakpoint: string = DEFAULT_MOBILE_BREAKPOINT;

  connectedCallback() {
    super.connectedCallback();
    const layout = unsafeCSS(buildCommerceLayout(this, this.mobileBreakpoint));
    AtomicCommerceLayout.styles.unshift(layout);
  }

  @errorGuard()
  render() {
    return html`<slot></slot>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'atomic-commerce-layout': AtomicCommerceLayout;
  }
}

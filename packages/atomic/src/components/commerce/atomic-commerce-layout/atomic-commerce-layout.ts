import {html, LitElement, unsafeCSS} from 'lit';
import {customElement, property, state} from 'lit/decorators.js';
import {errorGuard} from '@/src/decorators/error-guard';
import {CommerceLayoutMixin} from '@/src/mixins/commerce-layout-mixin';
import {DEFAULT_MOBILE_BREAKPOINT} from '../../../utils/replace-breakpoint';
import styles from './atomic-commerce-layout.tw.css';

/**
 * The `atomic-commerce-layout` helps organize elements in the commerce page.
 * @alpha
 */
@customElement('atomic-commerce-layout')
export class AtomicCommerceLayout extends CommerceLayoutMixin(
  LitElement,
  unsafeCSS(styles)
) {
  @state() error!: Error;

  /**
   * CSS value that defines where the layout goes from mobile to desktop.
   * e.g., 800px, 65rem.
   */
  @property({type: String, reflect: true, attribute: 'mobile-breakpoint'})
  mobileBreakpoint: string = DEFAULT_MOBILE_BREAKPOINT;

  createRenderRoot() {
    return this;
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

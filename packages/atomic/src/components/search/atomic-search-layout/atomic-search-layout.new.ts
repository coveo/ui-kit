import {errorGuard} from '@/src/decorators/error-guard';
import {SearchLayoutMixin} from '@/src/mixins/search-layout-mixin';
import {LitElement, html, unsafeCSS} from 'lit';
import {customElement, property, state} from 'lit/decorators.js';
import {DEFAULT_MOBILE_BREAKPOINT} from '../../../utils/replace-breakpoint';
import styles from './atomic-search-layout.tw.css';

/**
 * The `atomic-search-layout` helps organize elements in the page.
 */
@customElement('atomic-search-layout')
export class AtomicSearchLayout extends SearchLayoutMixin(
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
    'atomic-search-layout': AtomicSearchLayout;
  }
}

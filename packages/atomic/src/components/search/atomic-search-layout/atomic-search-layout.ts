import {LitElement, unsafeCSS} from 'lit';
import {customElement, property, state} from 'lit/decorators.js';
import {injectStylesForNoShadowDOM} from '@/src/decorators/inject-styles-for-no-shadow-dom';
import {randomID} from '@/src/utils/utils';
import {DEFAULT_MOBILE_BREAKPOINT} from '../../../utils/replace-breakpoint';
import styles from './atomic-search-layout.tw.css';
import {buildSearchLayout} from './search-layout';

/**
 * The `atomic-search-layout` helps organize elements in the page.
 *
 * @cssprop --atomic-layout-max-search-box-input-width: The maximum width that the search box input will take.
 * @cssprop --atomic-layout-max-search-box-double-suggestions-width: The maximum width that the search box suggestions will take when displaying a double list.
 * @cssprop --atomic-layout-search-box-left-suggestions-width: When displaying a double list, the width of the left list.
 */
@customElement('atomic-search-layout')
@injectStylesForNoShadowDOM
export class AtomicSearchLayout extends LitElement {
  static styles = [unsafeCSS(styles)];
  @state() error!: Error;

  /**
   * CSS value that defines where the layout goes from mobile to desktop.
   * e.g., 800px, 65rem.
   */
  @property({type: String, reflect: true, attribute: 'mobile-breakpoint'})
  mobileBreakpoint: string = DEFAULT_MOBILE_BREAKPOINT;

  connectedCallback() {
    super.connectedCallback();
    this.id = randomID('atomic-search-layout-');
    const layout = unsafeCSS(buildSearchLayout(this, this.mobileBreakpoint));
    AtomicSearchLayout.styles.unshift(layout);
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'atomic-search-layout': AtomicSearchLayout;
  }
}

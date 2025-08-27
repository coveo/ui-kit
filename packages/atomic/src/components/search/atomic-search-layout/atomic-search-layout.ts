import {LitElement, unsafeCSS} from 'lit';
import {customElement, property, state} from 'lit/decorators.js';
import {injectStylesForNoShadowDOM} from '@/src/decorators/inject-styles-for-no-shadow-dom';
import {ChildrenUpdateCompleteMixin} from '@/src/mixins/children-update-complete-mixin';
import {randomID} from '@/src/utils/utils';
import {DEFAULT_MOBILE_BREAKPOINT} from '../../../utils/replace-breakpoint';
import styles from './atomic-search-layout.tw.css';
import {buildSearchLayout} from './search-layout';

/**
 * The `atomic-search-layout` helps organize elements in the page.
 *
 * @cssprop --atomic-layout-max-search-box-input-width: The maximum width that the search box input will take.
 * @cssprop --atomic-layout-max-search-box-double-suggestions-width: The maximum width that the search box suggestions will take when displaying a double list.
 * @cssprop --atomic-layout-search-box-left-suggestions-width: The width of the left list when displaying a double list.
 */
@customElement('atomic-search-layout')
@injectStylesForNoShadowDOM
export class AtomicSearchLayout extends ChildrenUpdateCompleteMixin(
  LitElement
) {
  static styles = [styles];
  static async dynamicStyles(instance: AtomicSearchLayout) {
    await instance.getUpdateComplete();
    return unsafeCSS(buildSearchLayout(instance, instance.mobileBreakpoint));
  }
  @state() error!: Error;

  /**
   * The viewport width at which the layout goes from desktop to mobile.
   * E.g., 800px, 65rem.
   */
  @property({type: String, reflect: true, attribute: 'mobile-breakpoint'})
  mobileBreakpoint: string = DEFAULT_MOBILE_BREAKPOINT;

  connectedCallback() {
    super.connectedCallback();
    this.id = randomID('atomic-search-layout-');
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'atomic-search-layout': AtomicSearchLayout;
  }
}

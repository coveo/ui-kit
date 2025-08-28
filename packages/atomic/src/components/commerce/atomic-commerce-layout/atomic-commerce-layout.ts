import {LitElement, unsafeCSS} from 'lit';
import {customElement, property, state} from 'lit/decorators.js';
import {injectStylesForNoShadowDOM} from '@/src/decorators/inject-styles-for-no-shadow-dom';
import {ChildrenUpdateCompleteMixin} from '@/src/mixins/children-update-complete-mixin';
import {randomID} from '@/src/utils/utils';
import {DEFAULT_MOBILE_BREAKPOINT} from '../../../utils/replace-breakpoint';
import styles from './atomic-commerce-layout.tw.css';
import {buildCommerceLayout} from './commerce-layout';

/**
 * The `atomic-commerce-layout` helps organize elements in the commerce page.
 *
 * @cssprop --atomic-layout-max-search-box-input-width: The maximum width that the search box input will take.
 * @cssprop --atomic-layout-max-search-box-double-suggestions-width: The maximum width that the search box suggestions will take when displaying a double list.
 * @cssprop --atomic-layout-search-box-left-suggestions-width: The width of the left list when displaying a double list.
 *
 * @slot default - The default slot for the layout content.
 */
@customElement('atomic-commerce-layout')
@injectStylesForNoShadowDOM
export class AtomicCommerceLayout extends ChildrenUpdateCompleteMixin(
  LitElement
) {
  static styles = [styles];
  static async dynamicStyles(instance: AtomicCommerceLayout) {
    await instance.getUpdateComplete();
    return unsafeCSS(buildCommerceLayout(instance, instance.mobileBreakpoint));
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
    this.id = randomID('atomic-commerce-layout-');
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'atomic-commerce-layout': AtomicCommerceLayout;
  }
}

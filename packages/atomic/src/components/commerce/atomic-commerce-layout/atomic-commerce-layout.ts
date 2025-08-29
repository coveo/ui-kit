import {LitElement, unsafeCSS} from 'lit';
import {customElement, property, state} from 'lit/decorators.js';
import {ChildrenUpdateCompleteMixin} from '@/src/mixins/children-update-complete-mixin';
import {LightDomMixin} from '@/src/mixins/light-dom';
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
export class AtomicCommerceLayout extends LightDomMixin(
  ChildrenUpdateCompleteMixin(LitElement)
) {
  static styles = [styles];
  private async addStyles() {
    await this.getUpdateComplete();
    this.injectStyles(
      unsafeCSS(buildCommerceLayout(this, this.mobileBreakpoint))
    );
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
    this.addStyles();
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'atomic-commerce-layout': AtomicCommerceLayout;
  }
}

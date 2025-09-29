import {LitElement} from 'lit';
import {customElement, property, state} from 'lit/decorators.js';
import {LayoutStylesController} from '@/src/components/common/layout/layout-styles-controller';
import {watch} from '@/src/decorators/watch';
import {ChildrenUpdateCompleteMixin} from '@/src/mixins/children-update-complete-mixin';
import {LightDomMixin} from '@/src/mixins/light-dom';
import {DEFAULT_MOBILE_BREAKPOINT} from '../../../utils/replace-breakpoint-utils';
import styles from './atomic-commerce-layout.tw.css';
import {buildCommerceLayout} from './commerce-layout';

/**
 * The `atomic-commerce-layout` helps organize elements in the commerce page.
 *
 * @cssprop --atomic-layout-max-search-box-input-width: The maximum width that the search box input will take.
 * @cssprop --atomic-layout-max-search-box-double-suggestions-width: The maximum width that the search box suggestions will take when displaying a double list.
 * @cssprop --atomic-layout-search-box-left-suggestions-width: The width of the left list when displaying a double list.
 */
@customElement('atomic-commerce-layout')
export class AtomicCommerceLayout extends LightDomMixin(
  ChildrenUpdateCompleteMixin(LitElement)
) {
  static styles = [styles];

  @state() error!: Error;

  /**
   * The viewport width at which the layout goes from desktop to mobile.
   * E.g., 800px, 65rem.
   */
  @property({type: String, reflect: true, attribute: 'mobile-breakpoint'})
  mobileBreakpoint: string = DEFAULT_MOBILE_BREAKPOINT;

  private layoutStylesController = new LayoutStylesController(
    this,
    buildCommerceLayout,
    'atomic-commerce-layout-'
  );

  connectedCallback() {
    super.connectedCallback();
    this.emitBreakpointChangeEvent();
  }

  private emitBreakpointChangeEvent() {
    this.dispatchEvent(
      new CustomEvent('atomic-layout-breakpoint-change', {
        detail: {breakpoint: this.mobileBreakpoint},
        bubbles: true,
        composed: true,
      })
    );
  }

  @watch('mobileBreakpoint')
  public onMobileBreakpointChange() {
    this.layoutStylesController.updateStyles();
    this.emitBreakpointChangeEvent();
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'atomic-commerce-layout': AtomicCommerceLayout;
  }
}

import {LitElement} from 'lit';
import {customElement, property, state} from 'lit/decorators.js';
import {LayoutStylesController} from '@/src/components/common/layout/layout-styles-controller';
import {watch} from '@/src/decorators/watch';
import {ChildrenUpdateCompleteMixin} from '@/src/mixins/children-update-complete-mixin';
import {LightDomMixin} from '@/src/mixins/light-dom';
import {buildCustomEvent} from '@/src/utils/event-utils';
import {DEFAULT_MOBILE_BREAKPOINT} from '@/src/utils/replace-breakpoint-utils';
import styles from './atomic-search-layout.tw.css';
import {buildSearchLayout} from './search-layout';

/**
 * The `atomic-search-layout` helps organize elements in the page.
 *
 * @cssprop --atomic-layout-max-search-box-input-width: The maximum width that the search box input will take.
 * @cssprop --atomic-layout-max-search-box-double-suggestions-width: The maximum width that the search box suggestions will take when displaying a double list.
 * @cssprop --atomic-layout-search-box-left-suggestions-width: The width of the left list when displaying a double list.
 *
 * @event atomic-layout-breakpoint-change - Emitted when the mobile breakpoint changes. The event detail contains `{ breakpoint: string }`.
 */
@customElement('atomic-search-layout')
export class AtomicSearchLayout extends LightDomMixin(
  ChildrenUpdateCompleteMixin(LitElement)
) {
  static styles = [styles];

  @state() error!: Error;

  /**
   * The viewport width at which the layout goes from desktop to mobile.
   * For example: 800px, 65rem.
   */
  @property({type: String, reflect: true, attribute: 'mobile-breakpoint'})
  mobileBreakpoint: string = DEFAULT_MOBILE_BREAKPOINT;

  private layoutStylesController = new LayoutStylesController(
    this,
    buildSearchLayout,
    'atomic-search-layout-'
  );

  connectedCallback() {
    super.connectedCallback();
    this.emitBreakpointChangeEvent();
  }

  private emitBreakpointChangeEvent() {
    this.dispatchEvent(
      buildCustomEvent('atomic-layout-breakpoint-change', {
        breakpoint: this.mobileBreakpoint,
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
    'atomic-search-layout': AtomicSearchLayout;
  }
}

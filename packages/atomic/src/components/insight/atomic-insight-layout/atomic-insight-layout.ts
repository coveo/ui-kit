import {LitElement} from 'lit';
import {customElement, property, state} from 'lit/decorators.js';
import {LayoutStylesController} from '@/src/components/common/layout/layout-styles-controller';
import {booleanConverter} from '@/src/converters/boolean-converter';
import {watch} from '@/src/decorators/watch';
import {ChildrenUpdateCompleteMixin} from '@/src/mixins/children-update-complete-mixin';
import {LightDomMixin} from '@/src/mixins/light-dom';
import {DEFAULT_MOBILE_BREAKPOINT} from '../../../utils/replace-breakpoint-utils';
import {buildInsightLayout} from './insight-layout';

/**
 * The `atomic-insight-layout` helps organize elements in the insight page.
 */
@customElement('atomic-insight-layout')
export class AtomicInsightLayout extends LightDomMixin(
  ChildrenUpdateCompleteMixin(LitElement)
) {
  @state() error!: Error;

  /**
   * Whether the interface should be shown in widget format.
   */
  @property({type: Boolean, reflect: true, converter: booleanConverter})
  widget = false;

  /**
   * The viewport width at which the layout goes from desktop to mobile.
   * For example: 800px, 65rem.
   */
  @property({type: String, reflect: true, attribute: 'mobile-breakpoint'})
  mobileBreakpoint: string = DEFAULT_MOBILE_BREAKPOINT;

  private layoutStylesController = new LayoutStylesController(
    this,
    buildInsightLayout,
    'atomic-insight-layout-'
  );

  @watch('mobileBreakpoint')
  public onMobileBreakpointChange() {
    this.layoutStylesController.updateStyles();
  }

  @watch('widget')
  public onWidgetChange() {
    this.layoutStylesController.updateStyles();
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'atomic-insight-layout': AtomicInsightLayout;
  }
}

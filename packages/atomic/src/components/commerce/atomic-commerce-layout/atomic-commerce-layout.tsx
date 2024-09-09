import {Component, Element, Prop} from '@stencil/core';
import {
  InitializableComponent,
  InitializeBindings,
} from '../../../utils/initialization-utils';
import {DEFAULT_MOBILE_BREAKPOINT} from '../../../utils/replace-breakpoint';
import {randomID} from '../../../utils/utils';
import {CommerceBindings} from '../atomic-commerce-interface/atomic-commerce-interface';
import {buildCommerceLayout} from './commerce-layout';

/**
 * @alpha
 * The `atomic-commerce-layout` helps organize elements in the commerce page.
 */
@Component({
  tag: 'atomic-commerce-layout',
  styleUrl: 'atomic-commerce-layout.pcss',
  shadow: false,
})
export class AtomicCommerceLayout
  implements InitializableComponent<CommerceBindings>
{
  public error!: Error;

  @Element() private host!: HTMLElement;
  /**
   * CSS value that defines where the layout goes from mobile to desktop.
   * e.g., 800px, 65rem.
   */
  @Prop({reflect: true}) public mobileBreakpoint = DEFAULT_MOBILE_BREAKPOINT;
  @InitializeBindings() public bindings!: CommerceBindings;

  public componentDidLoad() {
    const id = this.host.id || randomID('atomic-commerce-layout-');
    this.host.id = id;
    const styleTag = this.bindings.createStyleElement();
    styleTag.innerHTML = buildCommerceLayout(this.host, this.mobileBreakpoint);
    this.host.appendChild(styleTag);
  }
}

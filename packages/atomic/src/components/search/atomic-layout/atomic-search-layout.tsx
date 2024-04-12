import {Component, Element, Prop} from '@stencil/core';
import {
  InitializableComponent,
  InitializeBindings,
} from '../../../utils/initialization-utils';
import {DEFAULT_MOBILE_BREAKPOINT} from '../../../utils/replace-breakpoint';
import {randomID} from '../../../utils/utils';
import {AnyBindings} from '../../common/interface/bindings';
import {buildSearchLayout} from './search-layout';

/**
 * The `atomic-search-layout` helps organize elements in the page.
 */
@Component({
  tag: 'atomic-search-layout',
  styleUrl: 'atomic-search-layout.pcss',
  shadow: false,
})
export class AtomicSearchLayout implements InitializableComponent<AnyBindings> {
  public error!: Error;

  @Element() private host!: HTMLElement;
  /**
   * CSS value that defines where the layout goes from mobile to desktop.
   * e.g., 800px, 65rem.
   */
  @Prop({reflect: true}) public mobileBreakpoint = DEFAULT_MOBILE_BREAKPOINT;
  @InitializeBindings() public bindings!: AnyBindings;

  public componentDidLoad() {
    const id = this.host.id || randomID('atomic-search-layout-');
    this.host.id = id;
    const styleTag = this.bindings.createStyleElement();
    styleTag.innerHTML = buildSearchLayout(this.host, this.mobileBreakpoint);
    this.host.appendChild(styleTag);
  }
}

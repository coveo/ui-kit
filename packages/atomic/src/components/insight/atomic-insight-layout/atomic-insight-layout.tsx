import {Component, Element, Prop, Watch} from '@stencil/core';
import {
  InitializableComponent,
  InitializeBindings,
} from '../../../utils/initialization-utils';
import {randomID} from '../../../utils/utils';
import {AnyBindings} from '../../common/interface/bindings';
import {buildInsightLayout} from './insight-layout';

/**
 * @internal
 */
@Component({
  tag: 'atomic-insight-layout',
  shadow: false,
})
export class AtomicInsightLayout
  implements InitializableComponent<AnyBindings>
{
  public error!: Error;
  private styleTag?: HTMLStyleElement;
  @Element() private host!: HTMLElement;
  /**
   * Whether the interface should be shown in widget format.
   */
  @Prop({reflect: true, mutable: true}) public widget = false;
  @InitializeBindings() public bindings!: AnyBindings;
  @Watch('widget')
  public updateStyles() {
    if (this.styleTag) {
      this.styleTag.innerHTML = buildInsightLayout(this.host, this.widget);
    } else {
      this.makeStyleTag();
    }
  }

  private makeStyleTag() {
    this.styleTag = this.bindings.createStyleElement();
    this.styleTag.innerHTML = buildInsightLayout(this.host, this.widget);
    this.host.appendChild(this.styleTag);
  }

  public componentDidLoad() {
    const id = this.host.id || randomID('atomic-insight-layout-');
    this.host.id = id;

    this.makeStyleTag();
  }
}

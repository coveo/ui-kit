import {
  Component,
  h,
  State,
  Prop,
  Element,
  Event,
  EventEmitter,
  Host,
} from '@stencil/core';
import {
  InitializableComponent,
  InitializeBindings,
} from '../../../utils/initialization-utils';
import {updateBreakpoints} from '../../../utils/replace-breakpoint-utils';
import {once, randomID} from '../../../utils/utils';
import {AnyBindings} from '../../common/interface/bindings';

/**
 * @internal
 */
@Component({
  tag: 'atomic-ipx-embedded',
  styleUrl: 'atomic-ipx-embedded.pcss',
  shadow: true,
})
export class AtomicIPXEmbedded implements InitializableComponent<AnyBindings> {
  @InitializeBindings() public bindings!: AnyBindings;
  @Element() public host!: HTMLElement;

  @State() public error!: Error;

  /**
   * The container to hide from the tabindex and accessibility DOM when the modal is closed.
   */
  @Prop({mutable: true}) container?: HTMLElement;

  /**
   * @migration Stencil's @Event() decorator defaults to: bubbles=true, composed=true, cancelable=true.
   * Native CustomEvent defaults to: bubbles=false, composed=false, cancelable=false.
   * When migrating to Lit, explicitly set all three options to preserve behavior:
   * `new CustomEvent('animationEnded', { bubbles: true, composed: true, cancelable: true })`
   */
  @Event() animationEnded!: EventEmitter<never>;

  @State() private hasFooterSlotElements = true;

  public componentWillLoad(): void | Promise<void> {
    this.hasFooterSlotElements = !!this.host.querySelector('[slot="footer"]');
  }

  public componentDidLoad() {
    const id = this.host.id || randomID('atomic-ipx-embedded-');
    this.host.id = id;
  }

  private updateBreakpoints = once(() => updateBreakpoints(this.host));

  public render() {
    this.updateBreakpoints();

    return (
      <Host>
        <div part="backdrop">
          <atomic-ipx-body displayFooterSlot={this.hasFooterSlotElements}>
            <slot name="header" slot="header" />
            <slot name="body" slot="body" />
            <slot name="footer" slot="footer" />
          </atomic-ipx-body>
        </div>
      </Host>
    );
  }
}

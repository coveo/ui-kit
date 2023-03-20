import {
  Component,
  h,
  State,
  Element,
  Event,
  EventEmitter,
  Prop,
} from '@stencil/core';
import {
  InitializableComponent,
  InitializeBindings,
} from '../../../utils/initialization-utils';
import {updateBreakpoints} from '../../../utils/replace-breakpoint';
import {once, randomID} from '../../../utils/utils';
import {AnyBindings} from '../../common/interface/bindings';

/**
 * @internal
 */
@Component({
  tag: 'atomic-ipx-body',
  styleUrl: 'atomic-ipx-body.pcss',
  shadow: true,
})
export class AtomicIPXBody implements InitializableComponent<AnyBindings> {
  @InitializeBindings() public bindings!: AnyBindings;
  @Element() public host!: HTMLElement;

  @State() public error!: Error;

  @Event() animationEnded!: EventEmitter<never>;

  @Prop() isOpen = true;

  @Prop({reflect: true}) displayFooterSlot = true;

  public componentDidLoad() {
    const id = this.host.id || randomID('atomic-ipx-body-');
    this.host.id = id;
  }

  private updateBreakpoints = once(() => updateBreakpoints(this.host));

  public render() {
    this.updateBreakpoints();

    return (
      <article
        part="container"
        class={`${this.isOpen ? 'visible' : 'invisible'}`}
        onAnimationEnd={() => this.animationEnded.emit()}
      >
        <header part="header-wrapper" class="flex flex-col items-center">
          <div part="header">
            <slot name="header"></slot>
          </div>
        </header>
        <hr part="header-ruler" class="border-neutral"></hr>
        <div
          part="body-wrapper"
          class="overflow-auto grow flex flex-col w-full"
        >
          <div part="body" class="w-full max-w-lg">
            <slot name="body"></slot>
          </div>
        </div>
        {this.displayFooterSlot && (
          <footer
            part="footer-wrapper"
            class="border-neutral border-t bg-background z-10 flex flex-col items-center w-full"
          >
            <div part="footer" class="max-w-lg">
              <slot name="footer"></slot>
            </div>
          </footer>
        )}
      </article>
    );
  }
}

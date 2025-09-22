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
import {updateBreakpoints} from '../../../utils/replace-breakpoint-utils';
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

  @Prop({mutable: true}) isOpen?: boolean;

  @Prop({reflect: true}) displayFooterSlot = true;

  public componentDidLoad() {
    const id = this.host.id || randomID('atomic-ipx-body-');
    this.host.id = id;
  }

  private updateBreakpoints = once(() => updateBreakpoints(this.host));

  public render() {
    this.updateBreakpoints();

    const isEmbedded = this.isOpen === undefined;
    return (
      <article
        part="container"
        class={`${isEmbedded ? '' : this.isOpen ? 'visible' : 'invisible'}`}
        onAnimationEnd={() => this.animationEnded.emit()}
      >
        <style>
          {`
            /* Chrome, Edge & Safari */
            .scrollbar::-webkit-scrollbar {
              width: 0.8rem;
            }

            .scrollbar::-webkit-scrollbar-track {
              background: var(--atomic-background);
            }

            .scrollbar::-webkit-scrollbar-thumb {
              background: var(--atomic-primary);
              border: 0.15rem solid var(--atomic-background);
              border-radius: 100vh;
            }

            .scrollbar::-webkit-scrollbar-thumb:hover {
              background: var(--atomic-primary-light);
            }

            /* Firefox */
            .scrollbar {
              scrollbar-color: var(--atomic-primary) var(--atomic-background);
              scrollbar-width: auto;
            }
          `}
        </style>
        <header part="header-wrapper" class="flex flex-col items-center">
          <div part="header">
            <slot name="header"></slot>
          </div>
        </header>
        <hr part="header-ruler" class="border-neutral"></hr>
        <div
          part="body-wrapper"
          class="scrollbar flex w-full grow flex-col overflow-auto"
        >
          <div part="body" class="w-full">
            <slot name="body"></slot>
          </div>
        </div>
        {this.displayFooterSlot && (
          <footer
            part="footer-wrapper"
            class="border-neutral bg-background z-10 flex w-full flex-col items-center border-t"
          >
            <div part="footer">
              <slot name="footer"></slot>
            </div>
          </footer>
        )}
      </article>
    );
  }
}

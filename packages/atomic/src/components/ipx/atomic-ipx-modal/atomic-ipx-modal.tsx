import {
  Component,
  h,
  State,
  Prop,
  Element,
  Watch,
  Event,
  EventEmitter,
  Host,
  Listen,
} from '@stencil/core';
import {isIOS} from '../../../utils/device-utils';
import {listenOnce} from '../../../utils/event-utils';
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
  tag: 'atomic-ipx-modal',
  styleUrl: 'atomic-ipx-modal.pcss',
  shadow: true,
})
export class AtomicIPXModal implements InitializableComponent<AnyBindings> {
  @InitializeBindings() public bindings!: AnyBindings;
  @Element() public host!: HTMLElement;

  @State() public error!: Error;

  @Prop({mutable: true}) source?: HTMLElement;
  /**
   * The container to hide from the tabindex and accessibility DOM when the modal is closed.
   */
  @Prop({mutable: true}) container?: HTMLElement;
  @Prop({reflect: true, mutable: true}) isOpen = false;
  @Prop({mutable: true}) close: () => void = () => (this.isOpen = false);

  @Event() animationEnded!: EventEmitter<never>;

  private focusTrap?: HTMLAtomicFocusTrapElement;
  private animatableContainer?: HTMLElement;
  private currentWatchToggleOpenExecution = 0;

  @Watch('isOpen')
  async watchToggleOpen(isOpen: boolean) {
    const watchToggleOpenExecution = ++this.currentWatchToggleOpenExecution;
    const modalOpenedClass = 'atomic-ipx-modal-opened';

    if (isOpen) {
      document.body.classList.add(modalOpenedClass);
      if (isIOS()) {
        await this.waitForAnimationEnded();
      }
      if (watchToggleOpenExecution !== this.currentWatchToggleOpenExecution) {
        return;
      }
      this.focusTrap!.active = true;
    } else {
      document.body.classList.remove(modalOpenedClass);
      if (isIOS()) {
        await this.waitForAnimationEnded();
      }
      if (watchToggleOpenExecution !== this.currentWatchToggleOpenExecution) {
        return;
      }
      this.focusTrap!.active = false;
    }
  }

  private waitForAnimationEnded() {
    // The focus trap focuses its first child when active. VoiceOver on iOS can't do it while an animation is ongoing.
    return new Promise((resolve) =>
      listenOnce(this.animatableContainer!, 'animationend', resolve)
    );
  }

  private getClasses() {
    const classes: string[] = [];
    if (this.isOpen) {
      classes.push('open');
    }

    classes.push('dialog');

    return classes;
  }

  @Listen('touchmove', {passive: false})
  onWindowTouchMove(e: Event) {
    this.isOpen && e.preventDefault();
  }

  public componentDidLoad() {
    const id = this.host.id || randomID('atomic-ipx-modal-');
    this.host.id = id;
    this.watchToggleOpen(this.isOpen);
  }

  private updateBreakpoints = once(() => updateBreakpoints(this.host));

  public render() {
    this.updateBreakpoints();

    return (
      <Host class={this.getClasses().join(' ')}>
        <div
          part="backdrop"
          class="fixed left-0 top-0 right-0 bottom-0 z-[9999]"
        >
          <atomic-focus-trap
            role="dialog"
            aria-modal={this.isOpen.toString()}
            source={this.source}
            container={this.container ?? this.host}
            ref={(ref) => (this.focusTrap = ref)}
          >
            <article
              part="container"
              class={`${this.isOpen ? 'visible' : 'invisible'}`}
              onAnimationEnd={() => this.animationEnded.emit()}
              ref={(ref) => (this.animatableContainer = ref)}
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
                <div
                  part="body"
                  class="w-full max-w-lg"
                  ref={(element) =>
                    element?.addEventListener(
                      'touchmove',
                      (e) => this.isOpen && e.stopPropagation(),
                      {passive: false}
                    )
                  }
                >
                  <slot name="body"></slot>
                </div>
              </div>
              <footer
                part="footer-wrapper"
                class="border-neutral border-t bg-background z-10 flex flex-col items-center w-full"
              >
                <div part="footer" class="max-w-lg">
                  <slot name="footer"></slot>
                </div>
              </footer>
            </article>
          </atomic-focus-trap>
        </div>
      </Host>
    );
  }
}

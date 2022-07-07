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
} from '@stencil/core';
import {isIOS} from '../../../utils/device-utils';
import {listenOnce} from '../../../utils/event-utils';
import {
  InitializableComponent,
  InitializeBindings,
} from '../../../utils/initialization-utils';
import {updateBreakpoints} from '../../../utils/replace-breakpoint';
import {once, randomID} from '../../../utils/utils';
import {SearchBindings} from '../atomic-search-interface/atomic-search-interface';

/**
 * When the modal is opened, the class `atomic-modal-opened` is added to the body, allowing further customization.
 *
 * @part backdrop - The transparent backdrop hiding the content behind the modal.
 * @part container - The modal's outermost container with the outline and background.
 * @part header-wrapper - The wrapper around the header.
 * @part header - The header at the top of the modal.
 * @part header-ruler - The horizontal ruler underneath the header.
 * @part body-wrapper - The wrapper around the body.
 * @part body - The body of the modal, between the header and the footer.
 * @part footer-wrapper - The wrapper with a shadow or background color around the footer.
 * @part footer - The footer at the bottom of the modal.
 * @internal
 */
@Component({
  tag: 'atomic-modal',
  styleUrl: 'atomic-modal.pcss',
  shadow: true,
})
export class AtomicModal implements InitializableComponent {
  @InitializeBindings() public bindings!: SearchBindings;
  @Element() public host!: HTMLElement;

  @State() public error!: Error;

  @Prop({reflect: true, mutable: true}) fullscreen = false;
  @Prop({mutable: true}) source?: HTMLElement;
  /**
   * The container to hide from the tabindex and accessibility DOM when the modal is closed.
   */
  @Prop({mutable: true}) container?: HTMLElement;
  @Prop({reflect: true, mutable: true}) isOpen = false;
  @Prop({mutable: true}) close: () => void = () => (this.isOpen = false);

  @Event() animationEnded!: EventEmitter<never>;

  private wasEverOpened = false;
  private headerId = randomID('atomic-modal-header-');
  private focusTrap?: HTMLAtomicFocusTrapElement;
  private animatableContainer?: HTMLElement;
  private currentWatchToggleOpenExecution = 0;

  @Watch('isOpen')
  async watchToggleOpen(isOpen: boolean) {
    const watchToggleOpenExecution = ++this.currentWatchToggleOpenExecution;
    const modalOpenedClass = 'atomic-modal-opened';

    if (isOpen) {
      this.wasEverOpened = true;
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
    if (this.fullscreen) {
      classes.push('fullscreen');
    } else {
      classes.push('dialog');
    }
    return classes;
  }

  public componentDidLoad() {
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
          onClick={(e) => e.target === e.currentTarget && this.close()}
        >
          <atomic-focus-trap
            role="dialog"
            aria-modal={this.isOpen.toString()}
            aria-labelledby={this.headerId}
            source={this.source}
            container={this.container ?? this.host}
            ref={(ref) => (this.focusTrap = ref)}
          >
            <article
              part="container"
              class={`flex flex-col justify-between bg-background text-on-background ${
                this.isOpen ? 'animate-scaleUpModal' : 'animate-slideDownModal'
              } ${this.wasEverOpened ? '' : 'invisible'}`}
              onAnimationEnd={() => this.animationEnded.emit()}
              ref={(ref) => (this.animatableContainer = ref)}
            >
              <header part="header-wrapper" class="flex flex-col items-center">
                <div
                  part="header"
                  class="flex justify-between text-xl w-full max-w-lg"
                  id={this.headerId}
                >
                  <slot name="header"></slot>
                </div>
              </header>
              <hr part="header-ruler" class="border-neutral"></hr>
              <div
                part="body-wrapper"
                class="overflow-auto grow flex flex-col items-center w-full"
              >
                <div part="body" class="w-full max-w-lg">
                  <slot name="body"></slot>
                </div>
              </div>
              <footer
                part="footer-wrapper"
                class="border-neutral border-t bg-background z-10 flex flex-col items-center w-full"
              >
                <div part="footer" class="w-full max-w-lg">
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

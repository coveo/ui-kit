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
import {AnyBindings} from '../interface/bindings';

/**
 * When the modal is opened, the class `atomic-modal-opened` is added to the interfaceElement and the body, allowing further customization.
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
export class AtomicModal implements InitializableComponent<AnyBindings> {
  @InitializeBindings() public bindings!: AnyBindings;
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
  @Prop({reflect: true}) scope?: HTMLElement;
  /**
   * Whether to display the open and close animations over the entire page or the atomic-modal only.
   */
  @Prop({reflect: true}) boundary: 'page' | 'element' = 'page';

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
      this.bindings.interfaceElement.classList.add(modalOpenedClass);
      await this.waitForAnimationEnded();
      if (watchToggleOpenExecution !== this.currentWatchToggleOpenExecution) {
        return;
      }
      this.focusTrap!.active = true;
    } else {
      document.body.classList.remove(modalOpenedClass);
      this.bindings.interfaceElement.classList.remove(modalOpenedClass);
      if (isIOS()) {
        await this.waitForAnimationEnded();
      }
      if (watchToggleOpenExecution !== this.currentWatchToggleOpenExecution) {
        return;
      }
      this.focusTrap!.active = false;
    }
  }

  @Listen('keyup', {target: 'body'})
  handleCloseOnEscape(e: KeyboardEvent) {
    if (e.key?.toLowerCase() === 'escape') {
      this.close();
    }
  }

  private waitForAnimationEnded() {
    // The focus trap focuses its first child when active. It cannot do that while an animation is ongoing.
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

  @Listen('touchmove', {passive: false})
  onWindowTouchMove(e: Event) {
    this.isOpen && e.preventDefault();
  }

  public componentDidLoad() {
    this.watchToggleOpen(this.isOpen);
  }

  private updateBreakpoints = once(() => updateBreakpoints(this.host));

  public render() {
    this.updateBreakpoints();

    const Content = () => (
      <article
        part="container"
        class={`bg-background text-on-background flex flex-col justify-between ${this.isOpen ? 'animate-open' : 'animate-close'} ${this.wasEverOpened ? '' : 'invisible'}`}
        onAnimationEnd={() => this.animationEnded.emit()}
        ref={(ref) => (this.animatableContainer = ref)}
      >
        <header part="header-wrapper" class="flex flex-col items-center">
          <div
            part="header"
            class="flex w-full max-w-lg justify-between text-xl"
            id={this.headerId}
          >
            <slot name="header"></slot>
          </div>
        </header>
        <hr part="header-ruler" class="border-neutral border-t"></hr>
        <div
          part="body-wrapper"
          class="flex w-full grow flex-col items-center overflow-auto"
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
          class="border-neutral bg-background z-10 flex w-full flex-col items-center border-t"
        >
          <div part="footer" class="w-full max-w-lg">
            <slot name="footer"></slot>
          </div>
        </footer>
      </article>
    );

    return (
      <Host class={this.getClasses().join(' ')}>
        <div
          part="backdrop"
          class={` ${this.boundary === 'page' ? 'fixed' : 'absolute'} z-100 bottom-0 left-0 right-0 top-0`}
          onClick={(e) => e.target === e.currentTarget && this.close()}
        >
          <atomic-focus-trap
            role="dialog"
            aria-modal={this.isOpen.toString()}
            aria-labelledby={this.headerId}
            source={this.source}
            container={this.container ?? this.host}
            ref={(ref) => (this.focusTrap = ref)}
            scope={this.scope}
          >
            <Content />
          </atomic-focus-trap>
        </div>
      </Host>
    );
  }
}

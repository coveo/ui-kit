import {
  Component,
  h,
  State,
  Prop,
  Element,
  Watch,
  Event,
  EventEmitter,
} from '@stencil/core';
import {
  Bindings,
  InitializableComponent,
  InitializeBindings,
  DeferUntilRender,
} from '../../utils/initialization-utils';
import {getFirstFocusableDescendant} from '../../utils/accessibility-utils';
import {updateBreakpoints} from '../../utils/replace-breakpoint';
import {once} from '../../utils/utils';

/**
 * @part container - The modal's outermost container with the outline and background.
 * @part header - The header at the top of the modal.
 * @part header-wrapper - The wrapper around the header.
 * @part header-ruler - The horizontal ruler underneath the header.
 * @part body - The body of the modal, between the header and the footer.
 * @part body-wrapper - The wrapper around the body.
 * @part footer - The footer at the bottom of the modal.
 * @part footer-wrapper - The wrapper with a shadow around the footer.
 * @part backdrop - The transparent backdrop hiding the content behind the modal.
 * @internal
 */
@Component({
  tag: 'atomic-modal',
  styleUrl: 'atomic-modal.pcss',
  shadow: true,
})
export class AtomicModal implements InitializableComponent {
  @InitializeBindings() public bindings!: Bindings;
  @Element() public host!: HTMLElement;

  @State() public error!: Error;

  @Prop({mutable: true}) source?: HTMLElement;
  @Prop({reflect: true, mutable: true}) isOpen = false;
  @Prop() close = () => (this.isOpen = false);

  @Event() animationEnded!: EventEmitter<never>;

  private wasEverOpened = false;

  @Watch('isOpen')
  watchToggleOpen(isOpen: boolean) {
    const modalOpenedClass = 'atomic-modal-opened';

    if (isOpen) {
      this.wasEverOpened = true;
      document.body.classList.add(modalOpenedClass);
      this.focusOnFirstElement();
    } else {
      document.body.classList.remove(modalOpenedClass);
      this.focusOnSource();
    }
  }

  @DeferUntilRender()
  private focusOnFirstElement() {
    getFirstFocusableDescendant(this.host)?.focus();
  }

  @DeferUntilRender()
  private focusOnSource() {
    this.source?.focus();
  }

  private updateBreakpoints = once(() => updateBreakpoints(this.host));

  public render() {
    if (!this.wasEverOpened) {
      return;
    }

    this.updateBreakpoints();

    return (
      <div
        part="backdrop"
        class={`fixed left-0 top-0 right-0 bottom-0 z-10 ${
          this.isOpen ? 'modal-opened' : ''
        }`}
        onClick={(e) => e.target === e.currentTarget && this.close()}
      >
        <atomic-focus-trap active={this.isOpen}>
          <article
            part="container"
            class={`flex flex-col justify-between bg-background text-on-background ${
              this.isOpen ? 'animate-scaleUpModal' : 'animate-slideDownModal'
            }`}
            aria-modal={this.isOpen.toString()}
            onAnimationEnd={() => this.animationEnded.emit()}
          >
            <header part="header-wrapper" class="flex flex-col items-center">
              <div
                part="header"
                class="flex justify-between text-xl w-full max-w-lg"
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
    );
  }
}

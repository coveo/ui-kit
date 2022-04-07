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

/**
 * @part container - The modal's outermost container with the outline and background.
 * @part header - The header at the top of the modal.
 * @part header-wrapper - The wrapper around the header.
 * @part header-ruler - The horizontal ruler underneath the header.
 * @part body - The body of the modal, between the header and the footer.
 * @part body-wrapper - The wrapper around the body.
 * @part footer - The footer at the bottom of the modal.
 * @part footer-wrapper - The wrapper with a shadow around the footer.
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

  public render() {
    if (!this.wasEverOpened) {
      return;
    }

    return (
      <atomic-focus-trap active={this.isOpen}>
        <article
          part="container"
          class={`fixed flex flex-col justify-between bg-background text-on-background left-0 top-0 right-0 bottom-0 z-10 ${
            this.isOpen ? 'animate-scaleUpModal' : 'animate-slideDownModal'
          }`}
          aria-modal={this.isOpen.toString()}
          onAnimationEnd={() => this.animationEnded.emit()}
        >
          <header part="header-wrapper" class="flex flex-col items-center px-6">
            <div
              part="header"
              class="flex justify-between text-xl py-6 w-full max-w-lg"
            >
              <slot name="header"></slot>
            </div>
          </header>
          <hr part="header-ruler" class="border-neutral"></hr>
          <div
            part="body-wrapper"
            class="overflow-auto grow px-6 flex flex-col items-center w-full"
          >
            <div part="body" class="w-full max-w-lg">
              <slot name="body"></slot>
            </div>
          </div>
          <footer
            part="footer-wrapper"
            class="px-6 border-neutral border-t bg-background z-10 shadow-lg flex flex-col items-center w-full"
          >
            <div part="footer" class="py-4 w-full max-w-lg">
              <slot name="footer"></slot>
            </div>
          </footer>
        </article>
      </atomic-focus-trap>
    );
  }
}

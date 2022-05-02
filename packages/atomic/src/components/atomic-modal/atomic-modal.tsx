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
import {once, randomID} from '../../utils/utils';

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
  @InitializeBindings() public bindings!: Bindings;
  @Element() public host!: HTMLElement;

  @State() public error!: Error;

  @Prop({mutable: true}) source?: HTMLElement;
  @Prop({reflect: true, mutable: true}) isOpen = false;
  @Prop({mutable: true}) close: () => void = () => (this.isOpen = false);

  @Event() animationEnded!: EventEmitter<never>;

  private wasEverOpened = false;
  private headerId = randomID('atomic-modal-header-');

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

  public componentWillRender() {
    this.wasEverOpened ||= this.isOpen;
  }

  private updateBreakpoints = once(() => updateBreakpoints(this.host));

  public render() {
    this.updateBreakpoints();

    if (!this.wasEverOpened) {
      return;
    }

    return (
      <div
        part="backdrop"
        class={`fixed left-0 top-0 right-0 bottom-0 z-10 ${
          this.isOpen ? 'opened' : ''
        }`}
        onClick={(e) => e.target === e.currentTarget && this.close()}
      >
        <atomic-focus-trap
          active={this.isOpen}
          role="dialog"
          aria-modal={this.isOpen.toString()}
          aria-labelledby={this.headerId}
        >
          <article
            part="container"
            class={`flex flex-col justify-between bg-background text-on-background ${
              this.isOpen ? 'animate-scaleUpModal' : 'animate-slideDownModal'
            }`}
            onAnimationEnd={() => this.animationEnded.emit()}
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
    );
  }
}

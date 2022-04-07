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
 * The `atomic-modal` is automatically created as a child of the `atomic-search-interface` when the `atomic-refine-toggle` is initialized.
 *
 * When the modal is opened, the class `atomic-modal-open` is added to the body, allowing further customization.
 *
 * @part container - The container of the modal's content.
 * @part header - The header of the modal, containing the title.
 * @part close-button - The button in the header that closes the modal.
 * @part section-title - The title for each section.
 * @part select - The `<select>` element of the drop-down list.
 * @part filter-clear-all - The button that resets all actively selected facet values.
 * @part footer-button - The button in the footer that closes the modal.
 */
@Component({
  tag: 'atomic-modal',
  styleUrl: 'atomic-modal.pcss',
  shadow: true,
})
export class AtomicRefineModal implements InitializableComponent {
  @InitializeBindings() public bindings!: Bindings;
  @Element() public host!: HTMLElement;

  @State() public error!: Error;

  @Prop({mutable: true}) source?: HTMLElement;
  @Prop({reflect: true, mutable: true}) isOpen = false;

  @Event() animationEnded!: EventEmitter<never>;

  @Watch('isOpen')
  watchToggleOpen(isOpen: boolean) {
    const modalOpenedClass = 'atomic-modal-opened';

    if (isOpen) {
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
          <header part="header" class="w-full p-6">
            <slot name="header"></slot>
          </header>
          <hr part="header-border" class="border-neutral"></hr>
          <div part="body" class="overflow-auto px-6 grow">
            <slot name="body"></slot>
          </div>
          <footer
            part="footer"
            class="px-6 py-4 w-full border-neutral border-t bg-background z-10"
          >
            <slot name="footer"></slot>
          </footer>
        </article>
      </atomic-focus-trap>
    );
  }
}

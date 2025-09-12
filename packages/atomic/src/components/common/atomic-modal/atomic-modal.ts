import {css, html, LitElement} from 'lit';
import {customElement, property, state} from 'lit/decorators.js';
import {createRef, type Ref, ref} from 'lit/directives/ref.js';
import {when} from 'lit/directives/when.js';
import {booleanConverter} from '@/src/converters/boolean-converter.js';
import {errorGuard} from '@/src/decorators/error-guard';
import type {InitializableComponent} from '@/src/decorators/types.js';
import {watch} from '@/src/decorators/watch.js';
import {withTailwindStyles} from '@/src/decorators/with-tailwind-styles.js';
import {listenOnce} from '../../../utils/event-utils.js';
import {updateBreakpoints} from '../../../utils/replace-breakpoint.js';
import {once, randomID} from '../../../utils/utils.js';
import type {AnyBindings} from '../interface/bindings.js';

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
@customElement('atomic-modal')
@withTailwindStyles
export class AtomicModal
  extends LitElement
  implements InitializableComponent<AnyBindings>
{
  static styles = css`
  @reference '../../../utils/tailwind.global.tw.css';
  
  @keyframes scaleUp {
    0% {
      transform: scale(0.7) translateY(150vh);
      opacity: 0;
    }
    100% {
      transform: scale(1) translateY(0px);
      opacity: 1;
    }
  }
  
  @keyframes slideDown {
    0% {
      transform: translateY(0px);
      opacity: 1;
    }
    100% {
      transform: translateY(150vh);
      opacity: 0;
    }
  }
  
  [part='backdrop'] {
    @apply pointer-events-none;
  }
  
  article.animate-open {
    @apply animate-scale-up-modal;
  }
  
  article.animate-close {
    @apply animate-slide-down-modal;
  }
  
  atomic-focus-trap {
    @apply contents;
  }
  
  [part='container'] {
    @apply overflow-hidden;
    grid-area: modal;
  }
  
  .animate-scaleUpModalIPX[part='container'] {
    @apply rounded;
    @apply shadow;
  }
  
  :host(.open) [part='backdrop'] {
    @apply pointer-events-auto;
  }
  
  :host(.open.dialog) [part='backdrop'] {
    background-color: rgba(40, 40, 40, 0.8);
  }
  
  :host(.dialog) [part='backdrop'] {
    @apply grid;
    @apply p-6;
    transition: background-color 500ms ease-in-out;
    grid-template-areas:
      '. .     .'
      '. modal .'
      '. .     .';
    grid-template-columns: 1fr min(30rem, 100%) 1fr;
    grid-template-rows: 1fr auto 3fr;
  }
  
  :host(.dialog) [part='container'] {
    @apply rounded;
    @apply shadow;
  }
  
  :host(.dialog) [part='header-wrapper'] {
    @apply px-6;
    @apply py-4;
  }
  
  :host(.dialog) [part='header'] {
    @apply font-bold;
  }
  
  :host(.dialog) [part='body-wrapper'] {
    @apply p-6;
  }
  
  :host(.dialog) [part='footer-wrapper'] {
    @apply bg-neutral-light;
    padding: 1rem 1.125rem;
  }
  
  :host(.fullscreen) [part='container'] {
    @apply absolute;
    @apply inset-0;
  }
  
  :host(.fullscreen) [part='header-wrapper'] {
    @apply p-6;
  }
  
  :host(.fullscreen) [part='body-wrapper'] {
    @apply px-6;
    @apply pt-8;
    @apply pb-5;
  }
  
  :host(.fullscreen) [part='footer-wrapper'] {
    @apply shadow-t-lg;
    @apply px-6;
    @apply py-4;
  }
  `;

  @state()
  bindings!: AnyBindings;

  @state()
  error!: Error;

  @property({type: Boolean, reflect: true, converter: booleanConverter})
  fullscreen = false;
  @property({type: Object, attribute: false}) source?: HTMLElement;
  /**
   * The container to hide from the tabindex and accessibility DOM when the modal is closed.
   */
  @property({type: Object, attribute: false}) container?: HTMLElement;
  @property({
    type: Boolean,
    reflect: true,
    attribute: 'is-open',
    converter: booleanConverter,
  })
  isOpen = false;
  @property({type: Object, attribute: false}) close: () => void = () =>
    // biome-ignore lint/suspicious/noAssignInExpressions: <>
    (this.isOpen = false);
  @property({type: Object, attribute: false}) scope?: HTMLElement;
  /**
   * Whether to display the open and close animations over the entire page or the atomic-modal only.
   */
  @property({type: String, reflect: true}) boundary: 'page' | 'element' =
    'page';

  private shouldRender = false;
  private headerId = randomID('atomic-modal-header-');
  private focusTrap: Ref<HTMLAtomicFocusTrapElement> = createRef();
  private animatableContainer: Ref<HTMLElement> = createRef();
  private currentWatchToggleOpenExecution = 0;

  private updateBreakpoints = once(() => updateBreakpoints(this));

  public initialize() {
    this.updateHostClasses();

    if (this.isOpen) {
      this.shouldRender = true;
      this.handleToggleOpen(this.isOpen);
    }
  }

  protected updated(changedProperties: Map<string, unknown>) {
    super.updated?.(changedProperties);

    if (
      changedProperties.has('isOpen') ||
      changedProperties.has('fullscreen')
    ) {
      this.updateHostClasses();
    }
  }

  private updateHostClasses() {
    const currentClasses = this.getAttribute('class') || '';
    const existingClasses = currentClasses
      .split(' ')
      .filter((cls) => cls && !['open', 'fullscreen', 'dialog'].includes(cls));

    const internalClasses: string[] = [];
    if (this.isOpen) {
      internalClasses.push('open');
    }
    if (this.fullscreen) {
      internalClasses.push('fullscreen');
    } else {
      internalClasses.push('dialog');
    }

    this.className = [...existingClasses, ...internalClasses].join(' ');
  }

  @watch('isOpen', {waitUntilFirstUpdate: false})
  watchToggleOpen(_prev?: boolean, next?: boolean) {
    this.handleToggleOpen(next ?? this.isOpen);
  }

  private async handleToggleOpen(isOpen: boolean) {
    if (isOpen) {
      await this.handleModalOpen();
    } else {
      await this.handleModalClose();
    }
  }

  private async handleModalOpen() {
    const executionId = this.createExecutionTracker();

    if (!this.shouldRender) {
      this.shouldRender = true;
      await this.updateComplete;
    }

    this.addModalOpenedClasses();

    await this.waitForAnimationEnded();
    if (!this.isExecutionValid(executionId)) {
      return;
    }

    this.setFocusTrapActive(true);
  }

  private async handleModalClose() {
    const executionId = this.createExecutionTracker();

    this.removeModalOpenedClasses();
    this.setFocusTrapActive(false);

    await this.waitForAnimationEnded();
    if (!this.isExecutionValid(executionId)) {
      return;
    }

    this.shouldRender = false;
  }

  private createExecutionTracker(): number {
    return ++this.currentWatchToggleOpenExecution;
  }

  private isExecutionValid(executionId: number): boolean {
    return executionId === this.currentWatchToggleOpenExecution;
  }

  private addModalOpenedClasses() {
    const modalOpenedClass = 'atomic-modal-opened';
    document.body.classList.add(modalOpenedClass);
    this.bindings?.interfaceElement.classList.add(modalOpenedClass);
  }

  private removeModalOpenedClasses() {
    const modalOpenedClass = 'atomic-modal-opened';
    document.body.classList.remove(modalOpenedClass);
    this.bindings?.interfaceElement.classList.remove(modalOpenedClass);
  }

  private setFocusTrapActive(active: boolean) {
    if (this.focusTrap.value) {
      this.focusTrap.value.active = active;
    }
  }

  private handleCloseOnEscape = (e: KeyboardEvent) => {
    if (e.key?.toLowerCase() === 'escape') {
      if (this.isOpen) {
        this.dispatchEvent(
          new CustomEvent('close', {bubbles: true, composed: true})
        );
      }
      if (this.close) {
        this.close();
      }
      this.isOpen = false;
    }
  };

  private onWindowTouchMove = (e: Event) => {
    this.isOpen && e.preventDefault();
  };

  connectedCallback() {
    super.connectedCallback();

    document.body.addEventListener('keyup', this.handleCloseOnEscape);
    document.body.addEventListener('touchmove', this.onWindowTouchMove, {
      passive: false,
    });
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    document.body.removeEventListener('keyup', this.handleCloseOnEscape);
    document.body.removeEventListener('touchmove', this.onWindowTouchMove);
  }

  private waitForAnimationEnded() {
    // The focus trap focuses its first child when active. It cannot do that while an animation is ongoing.
    return new Promise<void>((resolve) => {
      if (!this.animatableContainer.value) {
        resolve();
        return;
      }
      listenOnce(this.animatableContainer.value, 'animationend', () =>
        resolve()
      );
    });
  }

  private renderContent() {
    return html`
      <article
        part="container"
        class="bg-background text-on-background flex flex-col justify-between ${this.isOpen ? 'animate-open' : 'animate-close'}"
      
        ${ref(this.animatableContainer)}
      >
        <header part="header-wrapper" class="flex flex-col items-center">
          <div
            part="header"
            class="flex justify-between w-full max-w-lg text-xl"
            id=${this.headerId}
          >
            <slot name="header"></slot>
          </div>
        </header>
        <hr part="header-ruler" class="border-t border-neutral"/>
        <div
          part="body-wrapper"
          class="flex w-full grow flex-col items-center overflow-auto [scrollbar-gutter:stable_both-edges]"
        >
          <div
            part="body"
            class="w-full max-w-lg"
            @touchmove=${(e: Event) => this.isOpen && e.stopPropagation()}
          >
            <slot name="body"></slot>
          </div>
        </div>
        <footer
          part="footer-wrapper"
          class="z-10 flex flex-col items-center w-full border-t border-neutral bg-background"
        >
          <div part="footer" class="w-full max-w-lg">
            <slot name="footer"></slot>
          </div>
        </footer>
      </article>
    `;
  }

  @errorGuard()
  render() {
    this.updateBreakpoints();

    return html`
      ${when(
        this.shouldRender,
        () => html`
          <div
            part="backdrop"
            class=" ${this.boundary === 'page' ? 'fixed' : 'absolute'} top-0 right-0 bottom-0 left-0 z-9999"
            
            data-nosnippet
          >
            <atomic-focus-trap
              role="dialog"
              aria-modal=${this.isOpen ? 'true' : 'false'}
              aria-labelledby=${this.headerId}
              .source=${this.source}
              .container=${this.container ?? this}
              ${ref(this.focusTrap)}
              .scope=${this.scope}
            >
              ${this.renderContent()}
            </atomic-focus-trap>
          </div>
        `
      )}
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'atomic-modal': AtomicModal;
  }
}

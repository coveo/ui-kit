import {css, html, LitElement} from 'lit';
import {customElement, property, state} from 'lit/decorators.js';
import {createRef, type Ref, ref} from 'lit/directives/ref.js';
import {when} from 'lit/directives/when.js';
import {booleanConverter} from '@/src/converters/boolean-converter.js';
import {bindings} from '@/src/decorators/bindings.js';
import {errorGuard} from '@/src/decorators/error-guard';
import type {InitializableComponent} from '@/src/decorators/types.js';
import {watch} from '@/src/decorators/watch.js';
import {withTailwindStyles} from '@/src/decorators/with-tailwind-styles.js';
import {multiClassMap, tw} from '@/src/directives/multi-class-map.js';
import {InitializeBindingsMixin} from '@/src/mixins/bindings-mixin';
import {listenOnce} from '@/src/utils/event-utils.js';
import {updateBreakpoints} from '@/src/utils/replace-breakpoint-utils';
import {once, randomID} from '@/src/utils/utils.js';
import type {AtomicFocusTrap} from '../atomic-focus-trap/atomic-focus-trap.js';
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
 *
 * @internal
 */
@customElement('atomic-modal')
@bindings()
@withTailwindStyles
export class AtomicModal
  extends InitializeBindingsMixin(LitElement)
  implements InitializableComponent<AnyBindings>
{
  static styles = css`
  @reference '../../../utils/tailwind.global.tw.css';
  
  @keyframes scaleUp {
    from { transform: scale(0.7) translateY(150vh); opacity: 0; }
    to { transform: scale(1) translateY(0); opacity: 1; }
  }
  
  @keyframes slideDown {
    from { transform: translateY(0); opacity: 1; }
    to { transform: translateY(150vh); opacity: 0; }
  }

  article.animate-open {
    @apply animate-scale-up-modal;
  }
  
  article.animate-close {
    @apply animate-slide-down-modal;
  }
  
  .grid-template-modal {
        grid-template-areas:
      '. .     .'
      '. modal .'
      '. .     .';
    grid-template-columns: 1fr min(30rem, 100%) 1fr;
    grid-template-rows: 1fr auto 3fr;

  }
  `;

  @state()
  bindings!: AnyBindings;

  @state()
  error!: Error;

  /**
   * Whether to display the open and close animations over the entire page or the atomic-modal only.
   */
  @property({type: String, reflect: true}) boundary: 'page' | 'element' =
    'page';

  @property({type: Object, attribute: false}) close: () => void = () => {
    this.isOpen = false;
    return false;
  };

  /**
   * The container to hide from the tabindex and accessibility DOM when the modal is closed.
   */
  @property({type: Object, attribute: false}) container?: HTMLElement;

  @property({type: Boolean, reflect: true, converter: booleanConverter})
  fullscreen = false;

  @property({
    type: Boolean,
    reflect: true,
    attribute: 'is-open',
    converter: booleanConverter,
  })
  isOpen = false;

  @property({type: Object, attribute: false}) onAnimationEnded: () => void =
    () => {};

  @property({type: Object, attribute: false}) scope?: HTMLElement;

  @property({type: Object, attribute: false}) source?: HTMLElement;

  private animatableContainer: Ref<HTMLElement> = createRef();
  private currentWatchToggleOpenExecution = 0;
  private focusTrap: Ref<AtomicFocusTrap> = createRef();
  private headerId = randomID('atomic-modal-header-');
  private shouldRender = false;
  private updateBreakpoints = once(() => updateBreakpoints(this));

  // Lifecycle methods

  connectedCallback() {
    super.connectedCallback();

    document.body.addEventListener('keyup', this.handleCloseOnEscape);
    document.body.addEventListener('touchmove', this.onWindowTouchMove, {
      passive: false,
    });
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
            class=${multiClassMap(
              tw({
                'top-0 right-0 bottom-0 left-0 z-9999': true,
                fixed: this.boundary === 'page',
                absolute: this.boundary !== 'page',
                'grid p-6 transition-colors duration-500 ease-in-out grid-template-modal':
                  !this.fullscreen,
                'bg-[rgba(40,40,40,0.8)]': this.isOpen && !this.fullscreen,
                'pointer-events-auto': this.isOpen,
                'pointer-events-none': !this.isOpen,
              })
            )}
            @click="${(e: MouseEvent) => e.target === e.currentTarget && this.close()}"
            data-nosnippet
          >
            <atomic-focus-trap
              class="contents"
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

  disconnectedCallback() {
    super.disconnectedCallback();
    document.body.removeEventListener('keyup', this.handleCloseOnEscape);
    document.body.removeEventListener('touchmove', this.onWindowTouchMove);
  }

  // Public methods

  public async initialize() {
    if (this.isOpen) {
      this.shouldRender = true;
      await this.handleToggleOpen(this.isOpen);
    }
  }

  @watch('isOpen', {waitUntilFirstUpdate: false})
  async watchToggleOpen(_prev?: boolean, next?: boolean) {
    await this.handleToggleOpen(next ?? this.isOpen);
  }

  // Private methods

  private addModalOpenedClasses() {
    const modalOpenedClass = 'atomic-modal-opened';
    document.body.classList.add(modalOpenedClass);
    this.bindings?.interfaceElement?.classList?.add(modalOpenedClass);
  }

  private createExecutionTracker(): number {
    return ++this.currentWatchToggleOpenExecution;
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

  private async handleModalClose() {
    const executionId = this.createExecutionTracker();

    this.removeModalOpenedClasses();
    this.setFocusTrapActive(false);

    await this.waitForAnimationEnded();
    this.onAnimationEnded();
    if (!this.isExecutionValid(executionId)) {
      return;
    }

    this.shouldRender = false;
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

  private async handleToggleOpen(isOpen: boolean) {
    if (isOpen) {
      await this.handleModalOpen();
    } else {
      await this.handleModalClose();
    }
  }

  private isExecutionValid(executionId: number): boolean {
    return executionId === this.currentWatchToggleOpenExecution;
  }

  private onWindowTouchMove = (e: Event) => {
    this.isOpen && e.preventDefault();
  };

  private removeModalOpenedClasses() {
    const modalOpenedClass = 'atomic-modal-opened';
    document.body.classList.remove(modalOpenedClass);
    this.bindings?.interfaceElement?.classList?.remove(modalOpenedClass);
  }

  private renderContent() {
    return html`
      <article
        part="container"
        class=${multiClassMap(
          tw({
            '[grid-area:modal] bg-background text-on-background flex flex-col justify-between overflow-hidden': true,
            'animate-open': this.isOpen,
            'animate-close': !this.isOpen,
            'absolute inset-0': this.fullscreen,
            'rounded shadow': !this.fullscreen,
          })
        )}
        ${ref(this.animatableContainer)}
      >
        <header 
          part="header-wrapper" 
          class=${multiClassMap(
            tw({
              'flex flex-col items-center px-6 py-6': true,
              'py-4': !this.fullscreen,
            })
          )}
        >
          <div
            part="header"
            class=${multiClassMap(
              tw({
                'flex justify-between w-full max-w-lg text-xl': true,
                'font-bold': this.fullscreen,
              })
            )}
            id=${this.headerId}
          >
            <slot name="header"></slot>
          </div>
        </header>
        <hr part="header-ruler" class="border-t border-neutral"/>
        <div
          part="body-wrapper"
          class=${multiClassMap(
            tw({
              'flex w-full grow flex-col items-center overflow-auto [scrollbar-gutter:stable_both-edges]': true,
              'px-6 pt-8 pb-5': this.fullscreen,
              'p-6': !this.fullscreen,
            })
          )}
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
          class=${multiClassMap(
            tw({
              'z-10 flex flex-col items-center w-full border-t border-neutral bg-background': true,
              'px-6 py-4 shadow-t-lg': this.fullscreen,
              'bg-neutral-light px-4 py-4.5': !this.fullscreen,
            })
          )}
        >
          <div part="footer" class="w-full max-w-lg">
            <slot name="footer"></slot>
          </div>
        </footer>
      </article>
    `;
  }

  private setFocusTrapActive(active: boolean) {
    if (this.focusTrap.value) {
      this.focusTrap.value.active = active;
    }
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
}

declare global {
  interface HTMLElementTagNameMap {
    'atomic-modal': AtomicModal;
  }
}

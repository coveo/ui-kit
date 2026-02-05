import {type CSSResultGroup, css, html, LitElement} from 'lit';
import {customElement, property, state} from 'lit/decorators.js';
import type {AnyBindings} from '@/src/components/common/interface/bindings';
import {renderIpxBody} from '@/src/components/ipx/atomic-ipx-body/ipx-body';
import {booleanConverter} from '@/src/converters/boolean-converter';
import {bindings} from '@/src/decorators/bindings';
import {errorGuard} from '@/src/decorators/error-guard';
import {watch} from '@/src/decorators/watch';
import {withTailwindStyles} from '@/src/decorators/with-tailwind-styles';
import {InitializeBindingsMixin} from '@/src/mixins/bindings-mixin';
import {buildCustomEvent} from '@/src/utils/event-utils';
import {updateBreakpoints} from '@/src/utils/replace-breakpoint-utils';
import {once, randomID} from '@/src/utils/utils';

/**
 * The `atomic-ipx-modal` component is a modal component used for the In-Product Experience use case.
 *
 * It provides a modal dialog that can display header, body, and footer content through slots.
 * The modal can be controlled through the `isOpen` property and emits events when animations complete.
 *
 * @part atomic-ipx-modal - The main modal container.
 * @part backdrop - The backdrop behind the modal.
 * @part container - The modal's content container from atomic-ipx-body (via exportparts).
 *
 * @slot header - The header content of the modal.
 * @slot body - The main body content of the modal.
 * @slot footer - The footer content of the modal (optional).
 *
 * @cssprop [--atomic-ipx-width=31.25rem] - The width of the modal.
 * @cssprop [--atomic-ipx-height=43.75rem] - The height of the modal.
 *
 * @event animationEnded - Emitted when the modal animation ends.
 */
@customElement('atomic-ipx-modal')
@bindings()
@withTailwindStyles
export class AtomicIpxModal extends InitializeBindingsMixin(LitElement) {
  static styles: CSSResultGroup = css`
  @reference '../../../utils/tailwind.global.tw.css';

  atomic-focus-trap {
  @apply contents;
  height: inherit;
}

:host {
  width: var(--atomic-ipx-width, 31.25rem);
  height: var(--atomic-ipx-height, 43.75rem);
  max-width: calc(100vw - 3rem);
  max-height: calc(100vh - 4.25rem);
  box-shadow: rgb(0 0 0 / 50%) 0 0 0.5rem;
  inset: auto 3rem 4.25rem auto;
  position: fixed;
  z-index: 1000;
  display: none;

  [part='backdrop'] {
    @apply pointer-events-none;
    height: inherit;
  }
}

:host(.open) {
  display: block;

  [part='backdrop'] {
    @apply pointer-events-auto;
    height: inherit;
    max-height: calc(100vh - 4.25rem);
  }
}
  `;

  @state()
  bindings!: AnyBindings;

  @state()
  error!: Error;

  public initialize() {}

  /**
   * The element that triggered opening the modal.
   */
  @property({type: Object, attribute: false})
  source?: HTMLElement;

  /**
   * The container to hide from the tabindex and accessibility DOM when the modal is closed.
   */
  @property({type: Object, attribute: false})
  container?: HTMLElement;

  /**
   * Whether the modal is open.
   * Reflected to allow external consumers to observe the state via CSS attribute selectors.
   */
  @property({
    type: Boolean,
    reflect: true,
    attribute: 'is-open',
    converter: booleanConverter,
  })
  isOpen = false;

  @state() private hasFooterSlotElements = true;

  private updateBreakpoints = once(() => updateBreakpoints(this));

  connectedCallback() {
    super.connectedCallback();
    document.body.addEventListener('touchmove', this.onWindowTouchMove, {
      passive: false,
    });
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    document.body.removeEventListener('touchmove', this.onWindowTouchMove);
  }

  @watch('isOpen')
  watchToggleOpen() {
    const modalOpenedClass = 'atomic-ipx-modal-opened';

    if (this.isOpen) {
      document.body.classList.add(modalOpenedClass);
      this.bindings?.interfaceElement?.classList.add(modalOpenedClass);
      return;
    }
    document.body.classList.remove(modalOpenedClass);
    this.bindings?.interfaceElement?.classList.remove(modalOpenedClass);
  }

  willUpdate() {
    this.hasFooterSlotElements = !!this.querySelector('[slot="footer"]');
  }

  firstUpdated() {
    const id = this.id || randomID('atomic-ipx-modal-');
    this.id = id;
    this.setAttribute('part', 'atomic-ipx-modal');
    this.watchToggleOpen();
  }

  private onWindowTouchMove = (e: Event) => {
    if (this.isOpen) {
      e.preventDefault();
    }
  };

  private updateHostClasses() {
    this.classList.toggle('open', this.isOpen);
  }

  private handleAnimationEnded = () => {
    this.dispatchEvent(buildCustomEvent('animationEnded'));
  };

  @errorGuard()
  render() {
    this.updateBreakpoints();
    this.updateHostClasses();

    return html`
      <div part="backdrop">
        ${renderIpxBody({
          props: {
            visibility: this.isOpen ? 'open' : 'closed',
            displayFooterSlot: this.hasFooterSlotElements,
            onAnimationEnd: this.handleAnimationEnded,
            header: html`<slot name="header"></slot>`,
            body: html`<slot name="body"></slot>`,
            footer: html`<slot name="footer"></slot>`,
          },
        })}
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'atomic-ipx-modal': AtomicIpxModal;
  }
}

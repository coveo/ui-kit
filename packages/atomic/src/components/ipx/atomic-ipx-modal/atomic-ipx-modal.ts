import {type CSSResultGroup, css, html, LitElement} from 'lit';
import {customElement, property, state} from 'lit/decorators.js';
import {classMap} from 'lit/directives/class-map.js';
import {booleanConverter} from '@/src/converters/boolean-converter';
import {bindings} from '@/src/decorators/bindings';
import {errorGuard} from '@/src/decorators/error-guard';
import {watch} from '@/src/decorators/watch';
import {withTailwindStyles} from '@/src/decorators/with-tailwind-styles';
import {InitializeBindingsMixin} from '@/src/mixins/bindings-mixin';
import {updateBreakpoints} from '@/src/utils/replace-breakpoint-utils';
import {once, randomID} from '@/src/utils/utils';
import type {AnyBindings} from '../../common/interface/bindings';
import '../atomic-ipx-body/atomic-ipx-body';

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
 * @event animationEnded - Emitted when the modal animation ends.
 */
@customElement('atomic-ipx-modal')
@bindings()
@withTailwindStyles
export class AtomicIpxModal extends InitializeBindingsMixin(LitElement) {
  static styles: CSSResultGroup = css`
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
    }

    :host(.open) {
      display: block;
    }

    :host(.open) [part='backdrop'] {
      pointer-events: auto;
      height: inherit;
      max-height: calc(100vh - 4.25rem);
    }

    :host {
      display: none;
    }

    [part='backdrop'] {
      pointer-events: none;
      height: inherit;
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

  // Lifecycle methods

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
      this.bindings.interfaceElement.classList.add(modalOpenedClass);
      return;
    }
    document.body.classList.remove(modalOpenedClass);
    this.bindings.interfaceElement.classList.remove(modalOpenedClass);
  }

  willUpdate() {
    this.hasFooterSlotElements = !!this.querySelector('[slot="footer"]');
  }

  firstUpdated() {
    const id = this.id || randomID('atomic-ipx-modal-');
    this.id = id;
    this.watchToggleOpen();
  }

  private onWindowTouchMove = (e: Event) => {
    if (this.isOpen) {
      e.preventDefault();
    }
  };

  @errorGuard()
  render() {
    this.updateBreakpoints();

    return html`
      <div
        part="atomic-ipx-modal"
        class=${classMap({
          open: this.isOpen,
          dialog: true,
        })}
      >
        <div part="backdrop">
          <atomic-ipx-body
            .isOpen=${this.isOpen}
            .displayFooterSlot=${this.hasFooterSlotElements}
            exportparts="container"
          >
            <slot name="header" slot="header"></slot>
            <slot name="body" slot="body"></slot>
            <slot name="footer" slot="footer"></slot>
          </atomic-ipx-body>
        </div>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'atomic-ipx-modal': AtomicIPXModal;
  }
}

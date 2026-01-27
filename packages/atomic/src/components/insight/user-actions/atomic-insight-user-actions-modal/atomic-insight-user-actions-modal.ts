import '@/src/components/common/atomic-modal/atomic-modal';
import {html, LitElement, type PropertyValues} from 'lit';
import {customElement, property, state} from 'lit/decorators.js';
import {when} from 'lit/directives/when.js';
import {ATOMIC_MODAL_EXPORT_PARTS} from '@/src/components/common/atomic-modal/export-parts';
import {renderButton} from '@/src/components/common/button';
import type {InsightBindings} from '@/src/components/insight/atomic-insight-interface/atomic-insight-interface';
import {bindingGuard} from '@/src/decorators/binding-guard';
import {bindings} from '@/src/decorators/bindings';
import {errorGuard} from '@/src/decorators/error-guard';
import type {InitializableComponent} from '@/src/decorators/types';
import {rectEquals} from '@/src/utils/dom-utils';
import CloseIcon from '../../../../images/close.svg';

/**
 * The `atomic-insight-user-actions-modal` is automatically created as a child of the `atomic-insight-interface` when the `atomic-insight-user-actions-toggle` is initialized.
 *
 * When the modal is opened, the CSS class `atomic-modal-opened` is added to the interface element and the body, allowing further customization.
 *
 * @internal
 */
@customElement('atomic-insight-user-actions-modal')
@bindings()
export class AtomicInsightUserActionsModal
  extends LitElement
  implements InitializableComponent<InsightBindings>
{
  @state()
  public bindings!: InsightBindings;

  @state()
  public error!: Error;

  @state()
  private interfaceDimensions?: DOMRect;

  /**
   * The element that triggers the modal.
   */
  @property({type: Object, attribute: false})
  public openButton?: HTMLElement;

  /**
   * Whether the modal is open.
   */
  @property({type: Boolean, reflect: true, attribute: 'is-open'})
  public isOpen = false;

  /**
   * The ID of the user whose actions are being displayed.
   */
  @property({type: String, attribute: 'user-id'})
  public userId!: string;

  /**
   * The date and time when the case was created. For example "2024-01-01T00:00:00Z"
   */
  @property({type: String, attribute: 'ticket-creation-date-time'})
  public ticketCreationDateTime!: string;

  /**
   * The names of custom events to exclude.
   */
  @property({type: Array, attribute: 'excluded-custom-actions'})
  public excludedCustomActions: string[] = [];

  private animationFrameId?: number;

  public initialize() {
    // No controller needed for this component
  }

  connectedCallback() {
    super.connectedCallback();
    this.style.display = '';
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    if (this.animationFrameId !== undefined) {
      window.cancelAnimationFrame(this.animationFrameId);
    }
  }

  updated(changedProperties: PropertyValues) {
    if (changedProperties.has('isOpen') && this.isOpen) {
      this.onAnimationFrame();
    }
  }

  private onAnimationFrame() {
    if (!this.isOpen) {
      return;
    }
    if (this.dimensionChanged()) {
      this.updateDimensions();
    }
    this.animationFrameId = window.requestAnimationFrame(() =>
      this.onAnimationFrame()
    );
  }

  private dimensionChanged() {
    if (!this.interfaceDimensions) {
      return true;
    }

    return !rectEquals(
      this.interfaceDimensions,
      this.bindings.interfaceElement.getBoundingClientRect()
    );
  }

  private updateDimensions() {
    this.interfaceDimensions =
      this.bindings.interfaceElement.getBoundingClientRect();
  }

  private renderHeader() {
    return html`
      <div slot="header" class="contents">
        <div part="title" class="font-light truncate">
          ${this.bindings.i18n.t('user-actions')}
        </div>
        ${renderButton({
          props: {
            style: 'text-transparent',
            class: 'grid place-items-center',
            part: 'close-button',
            onClick: () => {
              this.isOpen = false;
            },
            ariaLabel: this.bindings.i18n.t('close'),
          },
        })(html`
          <atomic-icon
            part="close-icon"
            class="w-5 h-5"
            .icon=${CloseIcon}
          ></atomic-icon>
        `)}
      </div>
    `;
  }

  private renderBody() {
    return html`
      <aside
        style="height: 100%"
        slot="body"
        class="flex flex-col w-full px-2"
        aria-label=${this.bindings.i18n.t('user-actions-content')}
      >
        <atomic-insight-user-actions-timeline
          user-id=${this.userId}
          ticket-creation-date-time=${this.ticketCreationDateTime}
          .excludedCustomActions=${this.excludedCustomActions}
          class="flex-1"
        ></atomic-insight-user-actions-timeline>
      </aside>
    `;
  }

  @errorGuard()
  @bindingGuard()
  render() {
    return html`
      <style>
        atomic-modal::part(body-wrapper),
        atomic-modal::part(footer-wrapper) {
          padding: 2px;
        }
        ${when(
          this.interfaceDimensions,
          () => `
            atomic-modal::part(backdrop) {
              top: ${this.interfaceDimensions!.top}px;
              left: ${this.interfaceDimensions!.left}px;
              width: ${this.interfaceDimensions!.width}px;
              height: ${this.interfaceDimensions!.height}px;
            }
          `
        )}
      </style>
      <div class="absolute">
        <atomic-modal
          fullscreen
          .isOpen=${this.isOpen}
          .source=${this.openButton}
          .container=${this as HTMLElement}
          .close=${() => {
            this.isOpen = false;
          }}
          exportparts=${ATOMIC_MODAL_EXPORT_PARTS}
          .scope=${this.bindings.interfaceElement}
        >
          ${this.renderHeader()} ${this.renderBody()}
        </atomic-modal>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'atomic-insight-user-actions-modal': AtomicInsightUserActionsModal;
  }
}

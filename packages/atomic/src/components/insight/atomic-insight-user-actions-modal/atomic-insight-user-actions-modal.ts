import '@/src/components/common/atomic-modal/atomic-modal';
import {css, html, LitElement, type PropertyValues} from 'lit';
import {customElement, property, state} from 'lit/decorators.js';
import {when} from 'lit/directives/when.js';
import {ATOMIC_MODAL_EXPORT_PARTS} from '@/src/components/common/atomic-modal/export-parts';
import {renderButton} from '@/src/components/common/button';
import type {InsightBindings} from '@/src/components/insight/atomic-insight-interface/atomic-insight-interface';
import {booleanConverter} from '@/src/converters/boolean-converter';
import {bindingGuard} from '@/src/decorators/binding-guard';
import {bindings} from '@/src/decorators/bindings';
import {errorGuard} from '@/src/decorators/error-guard';
import type {InitializableComponent} from '@/src/decorators/types';
import {withTailwindStyles} from '@/src/decorators/with-tailwind-styles';
import {rectEquals} from '@/src/utils/dom-utils';
import CloseIcon from '../../../images/close.svg';

/**
 * The `atomic-insight-user-actions-modal` is automatically created as a child of the `atomic-insight-interface` when the `atomic-insight-user-actions-toggle` is initialized.
 *
 * When the modal is opened, the CSS class `atomic-modal-opened` is added to the interface element and the body, allowing further customization.
 *
 * @internal
 *
 * @part title - The title element displaying "user-actions" text.
 * @part close-button - The button used to close the modal.
 * @part close-icon - The close icon within the close button.
 *
 * @part backdrop - The transparent backdrop hiding the content behind the modal (inherited from atomic-modal).
 * @part container - The modal's outermost container with the outline and background (inherited from atomic-modal).
 * @part header-wrapper - The wrapper around the header (inherited from atomic-modal).
 * @part header - The header at the top of the modal (inherited from atomic-modal).
 * @part header-ruler - The horizontal ruler underneath the header (inherited from atomic-modal).
 * @part body-wrapper - The wrapper around the body (inherited from atomic-modal).
 * @part body - The body of the modal, between the header and the footer (inherited from atomic-modal).
 * @part footer-wrapper - The wrapper with a shadow or background color around the footer (inherited from atomic-modal).
 * @part footer - The footer at the bottom of the modal (inherited from atomic-modal).
 */
@customElement('atomic-insight-user-actions-modal')
@bindings()
@withTailwindStyles
export class AtomicInsightUserActionsModal
  extends LitElement
  implements InitializableComponent<InsightBindings>
{
  static styles = css`
    @reference '../../../utils/tailwind.global.tw.css';

    atomic-modal::part(body-wrapper),
    atomic-modal::part(footer-wrapper) {
      padding: 2px;
    }
  `;

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
  @property({
    type: Boolean,
    reflect: true,
    converter: booleanConverter,
    attribute: 'is-open',
  })
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

  disconnectedCallback() {
    super.disconnectedCallback();
    if (this.animationFrameId !== undefined) {
      window.cancelAnimationFrame(this.animationFrameId);
    }
  }

  public initialize() {
    // Noop
  }

  updated(changedProperties: PropertyValues) {
    if (changedProperties.has('isOpen') && this.isOpen) {
      this.onAnimationFrame();
    }
  }

  @errorGuard()
  @bindingGuard()
  render() {
    return html`
      ${when(
        this.interfaceDimensions,
        () => html`
          <style>
            atomic-modal::part(backdrop) {
              top: ${this.interfaceDimensions!.top}px;
              left: ${this.interfaceDimensions!.left}px;
              width: ${this.interfaceDimensions!.width}px;
              height: ${this.interfaceDimensions!.height}px;
            }
          </style>
        `
      )}
      <atomic-modal
        .fullscreen=${true}
        .isOpen=${this.isOpen}
        .source=${this.openButton}
        .container=${this}
        .close=${() => {
          this.isOpen = false;
        }}
        exportparts=${ATOMIC_MODAL_EXPORT_PARTS}
        .scope=${this.bindings.interfaceElement}
      >
        ${this.renderHeader()} ${this.renderBody()}
      </atomic-modal>
    `;
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
          .userId=${this.userId}
          .ticketCreationDateTime=${this.ticketCreationDateTime}
          .excludedCustomActions=${this.excludedCustomActions}
          class="flex-1"
        ></atomic-insight-user-actions-timeline>
      </aside>
    `;
  }

  private onAnimationFrame() {
    if (!this.isOpen) {
      this.animationFrameId = undefined;
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
}

declare global {
  interface HTMLElementTagNameMap {
    'atomic-insight-user-actions-modal': AtomicInsightUserActionsModal;
  }
}

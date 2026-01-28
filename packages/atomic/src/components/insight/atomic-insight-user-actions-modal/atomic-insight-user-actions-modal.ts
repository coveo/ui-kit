import '@/src/components/common/atomic-modal/atomic-modal';
import {css, html, LitElement} from 'lit';
import {customElement, property, state} from 'lit/decorators.js';
import {ATOMIC_MODAL_EXPORT_PARTS} from '@/src/components/common/atomic-modal/export-parts';
import {renderButton} from '@/src/components/common/button';
import type {InsightBindings} from '@/src/components/insight/atomic-insight-interface/atomic-insight-interface';
import {booleanConverter} from '@/src/converters/boolean-converter';
import {bindingGuard} from '@/src/decorators/binding-guard';
import {bindings} from '@/src/decorators/bindings';
import {errorGuard} from '@/src/decorators/error-guard';
import type {InitializableComponent} from '@/src/decorators/types';
import {withTailwindStyles} from '@/src/decorators/with-tailwind-styles';
import CloseIcon from '../../../images/close.svg';

/**
 * The `atomic-insight-user-actions-modal` is automatically created as a child of the `atomic-insight-interface` when the `atomic-insight-user-actions-toggle` is initialized.
 *
 * When the modal is opened, the CSS class `atomic-modal-opened` is added to the interface element and the body, allowing further customization.
 *
 * @internal
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

  public initialize() {
    // Noop
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

  @errorGuard()
  @bindingGuard()
  render() {
    return html`
      <atomic-modal
        .fullscreen=${true}
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
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'atomic-insight-user-actions-modal': AtomicInsightUserActionsModal;
  }
}

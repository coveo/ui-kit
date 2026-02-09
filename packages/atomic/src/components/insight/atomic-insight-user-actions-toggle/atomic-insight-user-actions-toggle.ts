import '@/src/components/insight/atomic-insight-user-actions-modal/atomic-insight-user-actions-modal';
import {Schema, StringValue} from '@coveo/bueno';
import {
  buildUserActions as buildInsightUserActions,
  type UserActions as InsightUserActions,
  type UserActionsState as InsightUserActionsState,
} from '@coveo/headless/insight';
import {html, LitElement} from 'lit';
import {customElement, property, state} from 'lit/decorators.js';
import {renderIconButton} from '@/src/components/common/icon-button';
import {ValidatePropsController} from '@/src/components/common/validate-props-controller/validate-props-controller';
import type {InsightBindings} from '@/src/components/insight/atomic-insight-interface/atomic-insight-interface';
import type {AtomicInsightUserActionsModal} from '@/src/components/insight/atomic-insight-user-actions-modal/atomic-insight-user-actions-modal';
import {bindStateToController} from '@/src/decorators/bind-state';
import {bindingGuard} from '@/src/decorators/binding-guard';
import {bindings} from '@/src/decorators/bindings';
import {errorGuard} from '@/src/decorators/error-guard';
import type {InitializableComponent} from '@/src/decorators/types';
import {withTailwindStyles} from '@/src/decorators/with-tailwind-styles.js';
import ClockIcon from '../../../images/clock.svg';

/**
 * The `atomic-insight-user-actions-toggle` component displays a button that opens a modal containing the user actions timeline component.
 * This is an internal component of the atomic-insight-interface.
 */
@customElement('atomic-insight-user-actions-toggle')
@bindings()
@withTailwindStyles
export class AtomicInsightUserActionsToggle
  extends LitElement
  implements InitializableComponent<InsightBindings>
{
  @state()
  bindings!: InsightBindings;

  @state()
  error!: Error;

  public userActions!: InsightUserActions;

  @bindStateToController('userActions')
  @state()
  public userActionsState!: InsightUserActionsState;

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

  private buttonRef?: HTMLButtonElement;
  private modalRef?: AtomicInsightUserActionsModal;

  constructor() {
    super();

    new ValidatePropsController(
      this,
      () => ({
        userId: this.userId,
        ticketCreationDateTime: this.ticketCreationDateTime,
      }),
      new Schema({
        userId: new StringValue({required: true, emptyAllowed: false}),
        ticketCreationDateTime: new StringValue({
          required: true,
          emptyAllowed: false,
        }),
      }),
      false
    );
  }

  public initialize() {
    this.userActions = buildInsightUserActions(this.bindings.engine, {
      options: {
        ticketCreationDate: this.ticketCreationDateTime,
        excludedCustomActions: this.excludedCustomActions,
      },
    });
  }

  private enableModal() {
    if (this.modalRef) {
      this.modalRef.isOpen = true;
    }
    this.userActions.logOpenUserActions();
  }

  private loadModal() {
    if (this.modalRef) {
      return;
    }

    this.modalRef = document.createElement('atomic-insight-user-actions-modal');

    this.insertAdjacentElement('beforebegin', this.modalRef);
    this.modalRef.openButton = this.buttonRef;
    this.modalRef.userId = this.userId;
    this.modalRef.ticketCreationDateTime = this.ticketCreationDateTime;
    this.modalRef.excludedCustomActions = this.excludedCustomActions;
  }

  @errorGuard()
  @bindingGuard()
  render() {
    return html`${renderIconButton({
      props: {
        partPrefix: 'insight-user-actions-toggle',
        style: 'outline-neutral',
        icon: ClockIcon,
        ariaLabel: this.bindings.i18n.t('user-actions'),
        onClick: () => this.enableModal(),
        title: this.bindings.i18n.t('user-actions'),
        buttonRef: (button) => {
          if (!button) {
            return;
          }
          this.buttonRef = button as HTMLButtonElement;
          this.loadModal();
        },
      },
    })}`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'atomic-insight-user-actions-toggle': AtomicInsightUserActionsToggle;
  }
}

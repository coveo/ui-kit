import {
  buildUserActions as buildInsightUserActions,
  UserActions as InsightUserActions,
  UserActionsState as InsightUserActionsState,
} from '@coveo/headless/insight';
import {Component, h, Prop, Element, State} from '@stencil/core';
import Clockicon from '../../../../images/clock.svg';
import {
  BindStateToController,
  InitializableComponent,
  InitializeBindings,
} from '../../../../utils/initialization-utils';
import {IconButton} from '../../../common/stencil-iconButton';
import {InsightBindings} from '../../atomic-insight-interface/atomic-insight-interface';

/**
 * Internal component of the atomic-insight-interface
 * The `atomic-insight-user-actions-toggle` component displays a button that opens a modal containing the user actions timeline component.
 */
@Component({
  tag: 'atomic-insight-user-actions-toggle',
  styleUrl: 'atomic-insight-user-actions-toggle.pcss',
  shadow: true,
})
export class AtomicInsightUserActionsToggle
  implements InitializableComponent<InsightBindings>
{
  @Element() public host!: HTMLElement;
  @InitializeBindings() public bindings!: InsightBindings;
  public userActions!: InsightUserActions;
  @BindStateToController('userActions')
  @State()
  public userActionsState!: InsightUserActionsState;
  @State() public error!: Error;

  /**
   * The ID of the user whose actions are being displayed.
   */
  @Prop() public userId!: string;
  /**
   * The date and time when the case was created. For example "2024-01-01T00:00:00Z"
   */
  @Prop() public ticketCreationDateTime!: string;
  /**
   * The names of custom events to exclude.
   */
  @Prop() public excludedCustomActions: string[] = [];

  public initialize() {
    this.userActions = buildInsightUserActions(this.bindings.engine, {
      options: {
        ticketCreationDate: this.ticketCreationDateTime,
        excludedCustomActions: this.excludedCustomActions,
      },
    });
  }

  private buttonRef?: HTMLButtonElement;
  private modalRef?: HTMLAtomicInsightUserActionsModalElement;

  private enableModal() {
    this.modalRef && (this.modalRef.isOpen = true);
    this.userActions.logOpenUserActions();
  }

  private loadModal() {
    if (this.modalRef) {
      return;
    }

    this.modalRef = document.createElement('atomic-insight-user-actions-modal');

    this.host.insertAdjacentElement('beforebegin', this.modalRef);
    this.modalRef.openButton = this.buttonRef;
    this.modalRef.userId = this.userId;
    this.modalRef.ticketCreationDateTime = this.ticketCreationDateTime;
    this.modalRef.excludedCustomActions = this.excludedCustomActions;
  }

  public render() {
    return (
      <IconButton
        partPrefix="insight-user-actions-toggle"
        style="outline-neutral"
        icon={Clockicon}
        ariaLabel={this.bindings.i18n.t('user-actions')}
        onClick={() => {
          this.enableModal();
        }}
        title={this.bindings.i18n.t('user-actions')}
        buttonRef={(button?: HTMLButtonElement) => {
          if (!button) {
            return;
          }
          this.buttonRef = button;
          this.loadModal();
        }}
      />
    );
  }
}

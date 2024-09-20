import {Component, h, Prop, Element, State} from '@stencil/core';
import Clockicon from '../../../../images/clock.svg';
import {InitializeBindings} from '../../../../utils/initialization-utils';
import {IconButton} from '../../../common/iconButton';
import {InsightBindings} from '../../atomic-insight-interface/atomic-insight-interface';

/**
 * @internal
 * The `atomic-insight-user-actions-toggle` component displays a button that opens a modal containing the user actions timeline component.
 */
@Component({
  tag: 'atomic-insight-user-actions-toggle',
  styleUrl: 'atomic-insight-user-actions-toggle.pcss',
  shadow: true,
})
export class AtomicInsightUserActionsToggle {
  @Element() public host!: HTMLElement;
  @InitializeBindings() public bindings!: InsightBindings;
  @State() public error!: Error;

  /**
   * The ID of the user whose actions are being displayed.
   */
  @Prop() public userId!: string;
  /**
   * The date and time when the case was created. For example "2024-01-01T00:00:00Z"
   */
  @Prop() public ticketCreationDateTime!: string;

  private buttonRef?: HTMLButtonElement;
  private modalRef?: HTMLAtomicInsightUserActionsModalElement;

  private enableModal() {
    this.modalRef && (this.modalRef.isOpen = true);
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

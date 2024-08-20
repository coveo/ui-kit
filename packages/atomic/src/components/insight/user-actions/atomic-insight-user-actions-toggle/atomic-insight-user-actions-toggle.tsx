import {Component, h, Prop, Element} from '@stencil/core';

/**
 * @internal
 */
@Component({
  tag: 'atomic-insight-user-actions-toggle',
  styleUrl: 'atomic-insight-user-actions-toggle.pcss',
  shadow: true,
})
export class AtomicInsightUserActionsToggle {
  @Prop() public tooltip = '';
  @Element() public host!: HTMLElement;

  private buttonRef?: HTMLButtonElement;
  private modalRef?: HTMLAtomicInsightRefineModalElement;

  private enableModal() {
    this.modalRef && (this.modalRef.isOpen = true);
  }

  private loadModal() {
    if (this.modalRef) {
      return;
    }

    this.modalRef = document.createElement('atomic-insight-user-actions-modal');

    this.host.parentElement?.insertAdjacentElement(
      'beforebegin',
      this.modalRef
    );
    this.modalRef.openButton = this.buttonRef;
  }

  public render() {
    return (
      <atomic-insight-history-toggle
        clickCallback={() => {
          this.enableModal();
        }}
        tooltip={this.tooltip}
        buttonRef={(button?: HTMLButtonElement) => {
          if (!button) {
            return;
          }
          this.buttonRef = button;
          this.loadModal();
        }}
      ></atomic-insight-history-toggle>
    );
  }
}

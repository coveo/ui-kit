import {Component, h, State, Element} from '@stencil/core';
import FilterIcon from '../../../images/filter.svg';

/**
 */
@Component({
  tag: 'atomic-insight-refine-toggle',
  shadow: true,
})
export class AtomicInsightRefineToggle {
  @Element() public host!: HTMLElement;

  @State() public error!: Error;

  private modalRef?: HTMLAtomicInsightRefineModalElement;
  private buttonRef?: HTMLButtonElement;

  private enableModal() {
    this.modalRef && (this.modalRef.isOpen = true);
  }

  private loadModal() {
    if (this.modalRef) {
      return;
    }

    this.modalRef = document.createElement('atomic-insight-refine-modal');
    this.host.parentElement?.insertAdjacentElement(
      'beforebegin',
      this.modalRef
    );
    this.modalRef.openButton = this.buttonRef;
  }

  public render() {
    return (
      <atomic-icon-button
        icon={FilterIcon}
        labelI18nKey="insight-history"
        clickCallback={() => this.enableModal()}
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

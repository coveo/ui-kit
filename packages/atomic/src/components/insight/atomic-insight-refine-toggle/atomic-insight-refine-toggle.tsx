import {Component, h, State, Element} from '@stencil/core';
import FilterIcon from '../../../images/filter.svg';
import {InitializeBindings} from '../../../utils/initialization-utils';
import {InsightBindings} from '../atomic-insight-interface/atomic-insight-interface';

/**
 */
@Component({
  tag: 'atomic-insight-refine-toggle',
  shadow: true,
})
export class AtomicInsightRefineToggle {
  @InitializeBindings() public bindings!: InsightBindings;
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
        clickCallback={() => {
          this.bindings.store.waitUntilAppLoaded(() => {
            this.enableModal();
          });
        }}
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

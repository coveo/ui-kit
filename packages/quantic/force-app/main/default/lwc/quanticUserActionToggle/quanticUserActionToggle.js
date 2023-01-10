import close from '@salesforce/label/c.quantic_Close';
import userActions from '@salesforce/label/c.quantic_UserActions';
import {LightningElement, api} from 'lwc';

/**
 * @typedef {Object} QuanticModalElement
 * @property {function} openModal
 * @property {function} closeModal
 * @property {boolean} fullScreen
 */

export default class QuanticUserActionToggle extends LightningElement {
  @api engineId;
  @api caseId;

  labels = {
    userActions,
    close,
  };

  /** @type {string} */
  modalId = 'userActionModal';
  /** @type {boolean} */
  modalIsOpen = false;

  /**
   * Returns the Quantic Modal element.
   * @return {QuanticModalElement}
   */
  get modal() {
    /** @type {Object} */
    const modal = this.template.querySelector(`[data-id=${this.modalId}]`);
    return modal;
  }

  /**
   * Opens the refine modal.
   * @returns {void}
   */
  openModal() {
    this.modal.openModal();
    this.sendModalEvent(true);
    this.modalIsOpen = true;
  }

  /**
   * Closes the refine modal.
   * @returns {void}
   */
  closeModal() {
    this.modal.closeModal();
    this.sendModalEvent(false);
    this.modalIsOpen = false;
  }

  /**
   * Sends the "quantic__modaltoggle" event.
   * @param {boolean} isOpen
   */
  sendModalEvent(isOpen) {
    const modalEvent = new CustomEvent('quantic__modaltoggle', {
      composed: true,
      bubbles: true,
      detail: {isOpen, parentName: 'C-QUANTIC-USER-ACTION-TOGGLE'},
    });
    this.dispatchEvent(modalEvent);
  }
}

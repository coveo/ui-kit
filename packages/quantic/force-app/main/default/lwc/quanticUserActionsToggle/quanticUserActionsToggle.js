import {LightningElement, api} from 'lwc';
import {
  registerComponentForInit,
  initializeWithHeadless,
  getHeadlessBundle,
} from 'c/quanticHeadlessLoader';
import userActions from '@salesforce/label/c.quantic_UserActions';

/** @typedef {import("coveo").InsightEngine} InsightEngine */
/** @typedef {import("coveo").UserActions} UserActions */

/**
 * @typedef {Object} QuanticModalElement
 * @property {function} openModal
 * @property {function} closeModal
 * @property {boolean} fullScreen
 */

/**
 * The `QuanticUserActionsToggle` component displays a button that opens a modal containing the user actions timeline component.
 * @category Insight Panel
 * @example
 * <c-quantic-user-actions-toggle engine-id={engineId} user-id="someone@company.com" ticket-creation-date-time="2024-01-01T00:00:00Z"></c-quantic-user-actions-toggle>
 */
export default class QuanticUserActionsToggle extends LightningElement {
  labels = {
    userActions,
  };

  /**
   * The ID of the engine instance the component registers to.
   * @api
   * @type {string}
   */
  @api engineId;
  /**
   * The ID of the user whose actions are being displayed. For example in email format "someone@company.com".
   * @api
   * @type {string}
   */
  @api userId;
  /**
   * The date and time when the ticket was created. For example "2024-01-01T00:00:00Z"
   * @api
   * @type {string}
   */
  @api ticketCreationDateTime;
  /**
   * The names of custom events to exclude.
   * @api
   * @type {Array<string>}
   * @default []
   */
  @api excludedCustomActions = [];

  /** @type {string} */
  modalId = 'userActionsModal';
  /** @type {AnyHeadless} */
  headless;
  /** @type {boolean} */
  modalIsOpen = false;
  /** @type {boolean} */
  hasInitializationError = false;
  /** @type {UserActions} */
  userActions;

  connectedCallback() {
    registerComponentForInit(this, this.engineId);
  }

  renderedCallback() {
    initializeWithHeadless(this, this.engineId, this.initialize);
  }

  /**
   * @param {InsightEngine} engine
   */
  initialize = (engine) => {
    this.headless = getHeadlessBundle(this.engineId);

    this.userActions = this.headless.buildUserActions(engine, {
      options: {
        ticketCreationDate: this.ticketCreationDateTime,
        excludedCustomActions: Array.isArray(this.excludedCustomActions)
          ? [...this.excludedCustomActions]
          : [],
      },
    });
  };

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
   * Opens the user actions modal.
   * @returns {void}
   */
  openModal() {
    this.modal.openModal();
    this.sendUserActionsModalEvent(true);
    this.modalIsOpen = true;
    this.userActions.logOpenUserActions();
  }

  /**
   * Closes the user actions modal.
   * @returns {void}
   */
  closeModal() {
    this.modal.closeModal();
    this.sendUserActionsModalEvent(false);
    this.modalIsOpen = false;
  }

  /**
   * Sends the "quantic__useractionsmodaltoggle" event.
   * @param {boolean} isOpen
   */
  sendUserActionsModalEvent(isOpen) {
    const userActionsModalEvent = new CustomEvent(
      'quantic__useractionstoggle',
      {
        composed: true,
        bubbles: true,
        detail: {isOpen},
      }
    );
    this.dispatchEvent(userActionsModalEvent);
  }

  /**
   * Sets the component in the initialization error state.
   */
  setInitializationError() {
    this.hasInitializationError = true;
  }
}

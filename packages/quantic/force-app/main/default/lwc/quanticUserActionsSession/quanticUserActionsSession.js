import {LightningElement, api} from 'lwc';
import {DateUtils} from 'c/quanticUtils';
import moreActionsInThisSession from '@salesforce/label/c.quantic_MoreActionsInThisSession';
import moreActionsInThisSession_plural from '@salesforce/label/c.quantic_MoreActionsInThisSession_plural';
import {I18nUtils} from 'c/quanticUtils';

/** @typedef {import("coveo").UserAction} UserAction */

/**
 * The `QuanticUserActionsSession` component displays all the user actions that took place during a specific user session.
 * @category Internal
 * @example
 * <c-quantic-user-actions-session user-actions={actions}></c-quantic-user-actions-session>
 */
export default class QuanticUserActionsSession extends LightningElement {
  /**
   * The start time of the session as a Unix timestamp.
   * @type {number}
   */
  @api startTimestamp;
  /**
   * The list of user actions performed during the session.
   * @type {Array<UserAction>}
   */
  @api userActions;

  /** @type {Array<UserAction>} */
  userActionsToDisplay;
  /** @type {Array<UserAction>} */
  userActionsAfterTicketCreation;
  /** @type {boolean} */
  areActionsAfterTicketCreationVisible;

  labels = {
    moreActionsInThisSession,
    moreActionsInThisSession_plural,
  };

  connectedCallback() {
    this.prepareUserActionsToDisplay();
  }

  prepareUserActionsToDisplay() {
    if (!this.isTicketCreationSession) {
      this.userActionsToDisplay = this.userActions ?? [];
      this.userActionsAfterTicketCreation = [];
    } else {
      const ticketCreationIndex = this.userActions.findIndex(
        ({actionType}) => actionType === 'TICKET_CREATION'
      );
      this.userActionsToDisplay = this.userActions.slice(ticketCreationIndex);
      this.userActionsAfterTicketCreation = this.userActions.slice(
        0,
        ticketCreationIndex
      );
    }
  }

  showActionsAfterTicketCreation() {
    this.areActionsAfterTicketCreationVisible = true;
  }

  get formatedStartDate() {
    const {year, month, dayOfWeek, day} = DateUtils.parseTimestampToDateDetails(
      Number(this.startTimestamp)
    );
    return `${dayOfWeek}. ${month} ${day}, ${year}`;
  }

  get isTicketCreationSession() {
    return this.userActions?.some(
      ({actionType}) => actionType === 'TICKET_CREATION'
    );
  }

  get isShowMoreActionsButtonVisible() {
    return (
      !this.areActionsAfterTicketCreationVisible &&
      !!this.userActionsAfterTicketCreation.length
    );
  }

  get showMoreActionsButtonLabel() {
    const labelName = I18nUtils.getLabelNameWithCount(
      'moreActionsInThisSession',
      this.userActionsAfterTicketCreation.length
    );

    return I18nUtils.format(
      this.labels[labelName],
      this.userActionsAfterTicketCreation.length
    );
  }
}

import moreActionsInSession from '@salesforce/label/c.quantic_MoreActionsInSession';
import moreActionsInSession_plural from '@salesforce/label/c.quantic_MoreActionsInSession_plural';
import to from '@salesforce/label/c.quantic_To';
import {I18nUtils} from 'c/quanticUtils';
import {LightningElement, api} from 'lwc';

/**
 * @typedef UserAction
 * @property {string} type
 * @property {string} title
 * @property {string} searchHub
 * @property {number} timestamp
 */

/**
 * The `QuanticUserActionSession` component displays all user actions that took place during a specific user session.
 * @category Insight Panel
 * @example
 * <c-quantic-user-action-session actions={actions} start-date={startDate} end-date={endDate} is-active-session></c-quantic-user-action-session>
 */
export default class QuanticUserActionSession extends LightningElement {
  /**
   * The start date of the user session.
   * @api
   * @type {number}
   */
  @api startDate;
  /**
   * The end date of the user session,
   * @api
   * @type {number}
   */
  @api endDate;
  /**
   * The actions that took place during this user session.
   * @api
   * @type {Array<UserAction>}
   */
  @api actions
  /**
   * Indicates if this is the session where the case was created.
   * @api
   * @type {boolean}
   */
  @api isActiveSession = false;

  labels = {
    moreActionsInSession,
    moreActionsInSession_plural,
    to,
  };
  ampmFormat = false;
  actionsAfterCaseCreationAreVisible = false;

  displayActionsAfterCaseCreation() {
    this.actionsAfterCaseCreationAreVisible = true;
  }

  get displayedActions() {
    if (!this.actions) {
      return [];
    }
    if (!this.isActiveSession) {
      return this.actions;
    }
    return this.actions.map((action) => {
      if (action.type === 'case-creation') {
        return {...action, type: 'active-case-creation'};
      }
      return action;
    });
  }

  get caseCreationActionIndex() {
    return this.displayedActions.findIndex(
      (action) => action.type === 'active-case-creation'
    );
  }

  get actionsAfterCaseCreation() {
    return this.displayedActions.slice(0, this.caseCreationActionIndex);
  }

  get actionsBeforeCaseCreation() {
    if (!this.isActiveSession) {
      return this.displayedActions;
    }
    return this.displayedActions.slice(
      this.caseCreationActionIndex,
      this.actions.length
    );
  }

  get actionsAfterCaseCreationAreAvailable() {
    return this.isActiveSession && this.actionsAfterCaseCreation.length;
  }

  get moreActionsButtonIsVisible() {
    return (
      this.actionsAfterCaseCreationAreAvailable &&
      !this.actionsAfterCaseCreationAreVisible
    );
  }

  get moreActionsLabel() {
    const labelName = I18nUtils.getLabelNameWithCount(
      'moreActionsInSession',
      this.actionsAfterCaseCreation.length
    );
    return `${I18nUtils.format(
      this.labels[labelName],
      this.actionsAfterCaseCreation.length
    )}`;
  }

  get actionsContainerClass() {
    return this.actionsAfterCaseCreationAreAvailable
      ? ''
      : 'slds-var-m-top_x-small';
  }
}

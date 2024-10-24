import {LightningElement, api} from 'lwc';
import {DateUtils} from 'c/quanticUtils';
// @ts-ignore
import actionTemplate from './templates/action.html';
// @ts-ignore
import viewActionTemplate from './templates/viewAction.html';
import ticketCreated from '@salesforce/label/c.quantic_TicketCreated';
import emptySearch from '@salesforce/label/c.quantic_EmptySearch';

/** @typedef {import("coveo").UserAction} UserAction */

const icons = {
  SEARCH: 'utility:search',
  CLICK: 'utility:file',
  VIEW: 'utility:preview',
  CUSTOM: 'utility:record',
  TICKET_CREATION: 'utility:priority',
};

/**
 * The `QuanticUserAction` component displays a single user action.
 * @category Internal
 * @example
 * <c-quantic-user-action action={action}></c-quantic-user-action>
 */
export default class QuanticUserAction extends LightningElement {
  /**
   * @type {UserAction}
   */
  @api action;

  labels = {
    ticketCreated,
    emptySearch,
  };
  clickableContentIdKeys = ['@clickableuri'];

  get iconName() {
    return icons[this.action?.actionType];
  }

  get searchHub() {
    return this.action?.searchHub ?? '';
  }

  get timestamp() {
    const {hours, minutes} = DateUtils.parseTimestampToDateDetails(
      Number(this.action?.timestamp)
    );

    const formattedHours = String(hours).padStart(2, '0');
    const formattedMinutes = String(minutes).padStart(2, '0');

    return `${formattedHours}:${formattedMinutes}`;
  }

  get actionTitle() {
    switch (this.action?.actionType) {
      case 'TICKET_CREATION':
        return this.labels.ticketCreated;
      case 'CUSTOM':
        return this.action.eventData?.value || this.action.eventData?.type;
      case 'SEARCH':
        return this.action.query || this.labels.emptySearch;
      case 'CLICK':
        return this.action.document?.title;
      case 'VIEW':
        return this.action.document?.title;
      default:
        return null;
    }
  }

  get contentIdValue() {
    return this.action?.document?.contentIdValue;
  }

  get contentIdKey() {
    return this.action?.document?.contentIdKey;
  }

  get iconClass() {
    switch (this.action?.actionType) {
      case 'TICKET_CREATION':
        return 'user-action__ticket-creation-icon';
      case 'CUSTOM':
        return 'user-action__custom-action-icon';
      case 'SEARCH':
        return 'user-action__search-action-icon';
      case 'CLICK':
        return 'user-action__click-action-icon';
      case 'VIEW':
        return 'user-action__view-action-icon';
      default:
        return 'null';
    }
  }

  get titleClass() {
    const isTicketCreation = this.action?.actionType === 'TICKET_CREATION';
    return `slds-var-p-vertical_x-small slds-text-title ${isTicketCreation ? 'slds-text-color_success user-action__ticket-creation-title' : 'user-action__title'}`;
  }

  render() {
    const viewEventCanBeDisplayedAsLink = this.clickableContentIdKeys.includes(
      this.contentIdKey
    );
    if (this.action?.actionType === 'VIEW' && viewEventCanBeDisplayedAsLink)
      return viewActionTemplate;
    return actionTemplate;
  }
}

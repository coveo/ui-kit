import {LightningElement, api} from 'lwc';

/**
 * @typedef Document
 * @property {string} title
 * @property {string} [clickUri]
 * @property {string} [uriHash]
 * @property {string} [contentIdKey]
 * @property {string} [contentIdValue]
 */

/**
 * @typedef UserAction
 * @property {'search' | 'click' | 'view' | 'custom' | 'case-creation' | 'active-case-creation'} actionType
 * @property {number} timestamp
 * @property {{type?: string, value: string}} [eventData]:
 * @property {string} [cause]
 * @property {string} searchHub
 * @property {string} [query]
 * @property {Document} document
 */

/**
 * The `QuanticUserActionEvent` component displays a single user action event in the user action timeline.
 * @category Insight Panel
 * @example
 * <c-quantic-user-action-event engine-id={engineId} action={action}></c-quantic-user-action-event>
 */
export default class QuanticUserActionEvent extends LightningElement {
  /**
   * The ID of the engine instance the component registers to.
   * @api
   * @type {string}
   */
  @api engineId;
  /**
   * The user action event to display.
   * @api
   * @type {UserAction}
   */
  @api action;
  /**
   * Indicates whether the user action event is the last event in a user action session.
   * @api
   * @type {boolean}
   */
  @api isLastEventInSession;

  /**
   * Returns the name of the icon to display.
   * @returns {string}
   */
  get iconName() {
    switch (this.action?.actionType) {
      case 'click':
        return 'utility:file';
      case 'search':
        return 'utility:search';
      case 'view':
        return 'utility:preview';
      case 'case-creation':
        return 'utility:priority';
      case 'active-case-creation':
        return 'utility:priority';
      default:
        return 'utility:record';
    }
  }

  ampmFormat = false;

  /**
   * Returns the variant of the icon to display.
   * @returns {'success' | null}
   */
  get iconVariant() {
    if (this.isActiveCaseCreationAction) {
      return 'success';
    }
    return null;
  }

  /**
   * Returns the CSS class of the icon to display.
   * @returns {string}
   */
  get iconClass() {
    if (this.isActiveCaseCreationAction) {
      return null;
    }
    if (this.isClickableAction) {
      return 'ua-event_blue-icon';
    }
    return 'ua-event_black-icon';
  }

  /**
   * Returns the CSS classes of the user action event title.
   * @returns {string}
   */
  get titleClass() {
    const classes = ['slds-text-title', 'slds-var-m-left_small'];
    if (this.isActiveCaseCreationAction) {
      classes.push('slds-text-color_success ua-event_bold-text');
    } else {
      classes.push('ua-event_black-text');
    }
    return classes.join(' ');
  }

  /**
   * Indicates whether the user action event is a click or a view event.
   * @returns {boolean}
   */
  get isClickOrViewAction() {
    return (
      this.action?.actionType === 'click' || this.action?.actionType === 'view'
    );
  }

  /**
   * Indicates whether the user action event is an active case creation event.
   * @returns {boolean}
   */
  get isActiveCaseCreationAction() {
    return this.action?.actionType === 'active-case-creation';
  }

  /**
   * Returns the CSS classes of the user action event info.
   * @returns {string}
   */
  get eventInfoClass() {
    return `slds-grid slds-var-m-left_small ${
      this.isLastEventInSession ? 'slds-var-p-left_xxx-small' : ''
    }`;
  }

  /**
   * Returns the user action title.
   * @returns {string}
   */
  get actionTitle() {
    return this.action?.document?.title;
  }

  /**
   * Returns the user action uri.
   * @returns {string}
   */
  get clickUri() {
    return this.action?.document?.clickUri;
  }

  /**
   * Indicates whether the user action event can be clickable.
   * @returns {boolean}
   */
  get isClickableAction() {
    return this.isClickOrViewAction && !!this.clickUri;
  }

  /**
   * Logs the needed analytics event.
   */
  logAnalytics() {
    // log analytics
  }
}

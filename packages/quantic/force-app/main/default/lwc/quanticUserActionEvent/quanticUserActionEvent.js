import {LightningElement, api} from 'lwc';

/**
 * The `QuanticUserActionEvent` component displays a single user action event in the user action timeline.
 * @category Insight Panel
 * @example
 * <c-quantic-user-action-event title="Example user action" type="view" timestamp="1672768867000" search-hub="default"></c-quantic-user-action-event>
 */
export default class QuanticUserActionEvent extends LightningElement {
  /**
   * The title of the user action event.
   * @api
   * @type {string}
   */
  @api title;
  /**
   * The type of the user action event.
   * @api
   * @type {'click' | 'view' | 'custom' | 'search' | 'case-creation' | 'active-case-creation'}
   */
  @api type;
  /**
   * The timestamp of the user action event.
   * @api
   * @type {number}
   */
  @api timestamp;
  /**
   * The search hub where the user action event originated.
   * @api
   * @type {string}
   */
  @api searchHub;
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
    switch (this.type) {
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
    if (this.isClickOrViewAction) {
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
    } else if (this.isClickOrViewAction) {
      classes.push('ua-event_blue-text');
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
    return this.type === 'click' || this.type === 'view';
  }

  /**
   * Indicates whether the user action event is an active case creation event.
   * @returns {boolean}
   */
  get isActiveCaseCreationAction() {
    return this.type === 'active-case-creation';
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
}

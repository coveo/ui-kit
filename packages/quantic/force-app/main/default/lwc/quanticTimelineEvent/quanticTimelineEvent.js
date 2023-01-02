import {LightningElement, api} from 'lwc';

/**
 * The `QuanticTimelineEvent` component displays a single user action event in the user action timeline.
 * @category Insight Panel
 * @example
 * <c-quantic-timeline-event title="Example user action" type="view" timestamp="10:45" search-hub="default"></c-quantic-timeline-event>
 */
export default class QuanticTimelineEvent extends LightningElement {
  /**
   * The title of the timeline event.
   * @api
   * @type {string}
   */
  @api title;
  /**
   * The type of the timeline event.
   * @api
   * @type {'click' | 'view' | 'custom' | 'search' | 'case-creation' | 'active-case-creation'}
   */
  @api type;
  /**
   * The timestamp of the timeline event.
   * @api
   * @type {string}
   */
  @api timestamp;
  /**
   * The search hub where the timeline event originated.
   * @api
   * @type {string}
   */
  @api searchHub;
  /**
   * Indicates whether the timeline event is the last event in a user action session.
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
      return 'timeline-event_blue-icon';
    }
    return 'timeline-event_black-icon';
  }

  /**
   * Returns the CSS classes of the timeline event title.
   * @returns {string}
   */
  get titleClass() {
    const classes = ['slds-text-title', 'slds-var-m-left_small'];
    if (this.isActiveCaseCreationAction) {
      classes.push('slds-text-color_success timeline-event_bold-text');
    } else if (this.isClickOrViewAction) {
      classes.push('timeline-event_blue-text');
    } else {
      classes.push('timeline-event_black-text');
    }
    return classes.join(' ');
  }

  /**
   * Indicates whether the timeline event is a click or a view event.
   * @returns {boolean}
   */
  get isClickOrViewAction() {
    return this.type === 'click' || this.type === 'view';
  }

  /**
   * Indicates whether the timeline event is an active case creation event.
   * @returns {boolean}
   */
  get isActiveCaseCreationAction() {
    return this.type === 'active-case-creation';
  }

  /**
   * Returns the CSS classes of the timeline event info.
   * @returns {string}
   */
  get eventInfoClass() {
    return `slds-grid slds-var-m-left_small ${
      this.isLastEventInSession ? 'slds-var-p-left_xxx-small' : ''
    }`;
  }
}

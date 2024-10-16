import {LightningElement, api} from 'lwc';
import {
  registerComponentForInit,
  initializeWithHeadless,
  getHeadlessBundle,
} from 'c/quanticHeadlessLoader';
import showFollowingSessions from '@salesforce/label/c.quantic_ShowFollowingSessions';
import hideFollowingSessions from '@salesforce/label/c.quantic_HideFollowingSessions';
import showPrecedingSessions from '@salesforce/label/c.quantic_ShowPrecedingSessions';
import hidePrecedingSessions from '@salesforce/label/c.quantic_HidePrecedingSessions';
import noUserActionsAssociatedWithParams from '@salesforce/label/c.quantic_NoUserActionsAssociatedWithParams';
import noUserActionsAvailable from '@salesforce/label/c.quantic_NoUserActionsAvailable';

// @ts-ignore
import userActionsTimelineTemplate from './templates/userActionsTimeline.html';
// @ts-ignore
import noUserActionsTemplate from './templates/noUserActions.html';
// @ts-ignore
import initializationErrorTemplate from './templates/initializationError.html';

/** @typedef {import("coveo").UserActions} UserActions */
/** @typedef {import("coveo").UserActionsState} UserActionsState */
/** @typedef {import("coveo").InsightEngine} InsightEngine */

/**
 * The `QuanticUserActionsTimeline` component displays all the actions performed by a user around the time they created a ticket.
 * The actions are grouped into multiple sessions, including the session during which the ticket was created,
 * the sessions preceding the ticket creation and the sessions following the ticket creation.
 *
 * @category Internal
 * @example
 * <c-quantic-user-actions-timeline engine-id={engineId} user-id="someone@company.com" ticket-creation-date-time="2024-01-01T00:00:00Z"></c-quantic-user-actions-timeline>
 */
export default class QuanticUserActionsTimeline extends LightningElement {
  /**
   * The ID of the engine instance the component registers to.
   * @api
   * @type {string}
   */
  @api engineId;
  /**
   * The ID of the user whose actions are being displayed. For example in email format "someone@company.com".
   * @type {string}
   */
  @api userId;
  /**
   * The date and time when the ticket was created. For example "2024-01-01T00:00:00Z"
   * @type {string}
   */
  @api ticketCreationDateTime;
  /**
   * The names of custom events to exclude.
   * @type {Array<string>}
   */
  @api excludedCustomActions = [];

  /** @type {UserActions} */
  userActions;
  /** @type {Function} */
  unsubscribe;
  /** @type {AnyHeadless} */
  headless;
  /** @type {boolean} */
  followingSessionsAreVisible = false;
  /** @type {boolean} */
  precedingSessionsAreVisible = false;
  /** @type {UserActionsState} */
  state;
  /** @type {boolean} */
  hasInitializationError = false;
  /** @type {Array<string>} */
  _excludedCustomActions;

  labels = {
    showFollowingSessions,
    hideFollowingSessions,
    showPrecedingSessions,
    hidePrecedingSessions,
    noUserActionsAssociatedWithParams,
    noUserActionsAvailable,
  };

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

    if (this.excludedCustomActions?.length) {
      this._excludedCustomActions = [...this.excludedCustomActions];
    } else {
      this._excludedCustomActions = [];
    }
    this.userActions = this.headless.buildUserActions(engine, {
      options: {
        ticketCreationDate: this.ticketCreationDateTime,
        excludedCustomActions: this._excludedCustomActions,
      },
    });

    this.userActions.fetchUserActions(this.userId);
    this.unsubscribe = this.userActions.subscribe(() => this.updateState());
  };

  disconnectedCallback() {
    this.unsubscribe?.();
  }

  updateState() {
    this.state = this.userActions.state;
  }

  toggleFollowingSessions() {
    this.followingSessionsAreVisible = !this.followingSessionsAreVisible;
  }

  togglePrecedingSessions() {
    this.precedingSessionsAreVisible = !this.precedingSessionsAreVisible;
  }

  get followingSessions() {
    return this.state?.timeline?.followingSessions;
  }

  get precedingSessions() {
    return this.state?.timeline?.precedingSessions;
  }

  get ticketCreationSession() {
    return this.state?.timeline?.session;
  }

  get isFollowingSessionsSectionVisible() {
    return !!this.followingSessions?.length;
  }

  get isPrecedingSessionsSectionVisible() {
    return !!this.precedingSessions?.length;
  }

  get toggleFollowingSessionsButtonLabel() {
    return this.followingSessionsAreVisible
      ? this.labels.hideFollowingSessions
      : this.labels.showFollowingSessions;
  }

  get toggleFollowingSessionsButtonIconName() {
    return this.followingSessionsAreVisible
      ? 'utility:arrowdown'
      : 'utility:arrowup';
  }

  get togglePrecedingSessionsButtonLabel() {
    return this.precedingSessionsAreVisible
      ? this.labels.hidePrecedingSessions
      : this.labels.showPrecedingSessions;
  }

  get togglePrecedingSessionsButtonIconName() {
    return this.precedingSessionsAreVisible
      ? 'utility:arrowup'
      : 'utility:arrowdown';
  }

  /**
   * Sets the component in the initialization error state.
   */
  setInitializationError() {
    this.hasInitializationError = true;
  }

  render() {
    if (this.hasInitializationError) {
      return initializationErrorTemplate;
    }

    const areUserActionsAvailable = this.state?.timeline?.session;
    const hasError = this.state?.error;

    if (areUserActionsAvailable && !hasError) {
      return userActionsTimelineTemplate;
    }
    return noUserActionsTemplate;
  }
}

import {
  registerComponentForInit,
  initializeWithHeadless,
  getHeadlessBundle,
} from 'c/quanticHeadlessLoader';
import {AriaLiveRegion} from 'c/quanticUtils';
import {LightningElement, api} from 'lwc';

/** @typedef {import("coveo").SearchEngine} SearchEngine */
/** @typedef {import("coveo").SearchStatus} SearchStatus */
/** @typedef {import("coveo").NotifyTrigger} NotifyTrigger */
/** @typedef {import("coveo").NotifyTriggerState} NotifyTriggerState */

/**
 * The `QuanticNotifications` component is responsible for displaying notifications generated by the Coveo Search API (see [Trigger](https://docs.coveo.com/en/1458)).
 * @category Search
 * @category Insight Panel
 * @example
 * <c-quantic-notifications engine-id={engineId}></c-quantic-notifications>
 */
export default class QuanticNotifications extends LightningElement {
  /**
   * The ID of the engine instance the component registers to.
   * @api
   * @type {string}
   */
  @api engineId;

  /** @type {NotifyTrigger} */
  notifyTrigger;
  /** @type {NotifyTriggerState} */
  notifyTriggerState;
  /** @type {boolean} */
  hasInitializationError = false;
  /** @type {import('c/quanticUtils').AriaLiveUtils} */
  ariaLiveNotificationsRegion;
  /** @type {Array} */
  notifications = [];
  /** @type {Function} */
  unsubscribe;
  /** @type {Function} */
  unsubscribeSearchStatus;

  connectedCallback() {
    registerComponentForInit(this, this.engineId);
  }

  renderedCallback() {
    initializeWithHeadless(this, this.engineId, this.initialize);
  }

  /**
   * @param {SearchEngine} engine
   */
  initialize = (engine) => {
    this.headless = getHeadlessBundle(this.engineId);
    this.notifyTrigger = this.headless.buildNotifyTrigger(engine);
    this.searchStatus = this.headless.buildSearchStatus(engine);
    this.ariaLiveNotificationsRegion = AriaLiveRegion('notifications', this);
    this.unsubscribe = this.notifyTrigger.subscribe(() => this.updateState());
    this.unsubscribeSearchStatus = this.searchStatus.subscribe(() =>
      this.handleSearchStatusChange()
    );
  };

  disconnectedCallback() {
    this.unsubscribe?.();
    this.unsubscribeSearchStatus?.();
  }

  updateState() {
    this.notifyTriggerState = this.notifyTrigger?.state;

    this.ariaLiveNotificationsRegion.dispatchMessage(
      this.notifyTriggerState?.notifications.reduce(
        (value, notification, index) => {
          return `${value} Notification ${index + 1}: ${notification}`;
        },
        ''
      )
    );
  }

  handleSearchStatusChange() {
    if (!this.searchStatus.state.isLoading) {
      this.notifications =
        this.notifyTrigger?.state?.notifications.map((notification, index) => ({
          value: notification,
          id: index.toString(),
          visible: true,
        })) ?? [];
    }
  }

  handleNotificationClose(event) {
    const currentNotificationId = event.currentTarget.dataset.id;
    this.notifications = this.notifications.map((notification) => {
      if (notification.id === currentNotificationId) {
        return {...notification, visible: false};
      }
      return notification;
    });
  }

  /**
   * Sets the component in the initialization error state.
   */
  setInitializationError() {
    this.hasInitializationError = true;
  }
}

import {
  registerComponentForInit,
  initializeWithHeadless,
  getHeadlessBundle,
} from 'c/quanticHeadlessLoader';
import {AriaLiveRegion} from 'c/quanticUtils';
import {LightningElement, api} from 'lwc';

/** @typedef {import("coveo").SearchEngine} SearchEngine */
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
    this.ariaLiveNotificationsRegion = AriaLiveRegion('notifications', this);
    this.unsubscribe = this.notifyTrigger.subscribe(() => this.updateState());
  };

  disconnectedCallback() {
    this.unsubscribe?.();
  }

  updateState(updatedNotifications) {
    this.notifyTriggerState = updatedNotifications
      ? updatedNotifications
      : this.notifyTrigger.state;
    this.ariaLiveNotificationsRegion.dispatchMessage(
      this.notifyTriggerState?.notifications.reduce(
        (value, notification, index) => {
          return `${value} Notification ${index + 1}: ${notification}`;
        },
        ''
      )
    );
  }

  handleNotificationClose(event) {
    const currentNotificationId = event.currentTarget.dataset.id;
    const filteredNotifications =
      this.notifyTriggerState?.notifications.filter((notification, index) => {
        return currentNotificationId !== index.toString();
      }) ?? [];

    this.notifyTriggerState.notifications = filteredNotifications;
    this.updateState({notifications: filteredNotifications});
  }

  get notifications() {
    return (
      this.notifyTriggerState?.notifications.map((notification, index) => ({
        value: notification,
        id: index,
      })) ?? []
    );
  }

  /**
   * Sets the component in the initialization error state.
   */
  setInitializationError() {
    this.hasInitializationError = true;
  }
}

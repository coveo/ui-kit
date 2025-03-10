import {
  registerComponentForInit,
  initializeWithHeadless,
  getHeadlessBundle,
} from 'c/quanticHeadlessLoader';
import closeNotification from '@salesforce/label/c.quantic_CloseNotification';
import {AriaLiveRegion} from 'c/quanticUtils';
import {LightningElement, api} from 'lwc';

/** @typedef {import("coveo").SearchEngine} SearchEngine */
/** @typedef {import("coveo").SearchStatus} SearchStatus */
/** @typedef {import("coveo").NotifyTrigger} NotifyTrigger */

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
  /** @type {SearchStatus} */
  searchStatus;

  labels = {
    closeNotification,
  };

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
    this.notifications =
      this.notifyTrigger?.state?.notifications.map((notification, index) => ({
        value: notification,
        id: index,
        visible: true,
      })) ?? [];

    this.dispatchAriaLiveNotificationsRegionMessage();
  }

  handleSearchStatusChange() {
    if (!this.searchStatus?.state.isLoading) {
      if (this.searchStatus?.state?.hasError) {
        this.notifications = [];
      } else {
        this.notifications =
          this.notifications?.map((notification) => ({
            ...notification,
            visible: true,
          })) ?? [];
        this.dispatchAriaLiveNotificationsRegionMessage();
      }
    }
  }

  handleNotificationClose(event) {
    const currentNotificationId = event.currentTarget.dataset.id;
    this.notifications = this.notifications.map((notification) => {
      if (notification.id.toString() === currentNotificationId) {
        return {...notification, visible: false};
      }
      return notification;
    });
  }

  dispatchAriaLiveNotificationsRegionMessage() {
    this.ariaLiveNotificationsRegion.dispatchMessage(
      this.notifications.reduce((value, notification) => {
        return `${value} Notification ${notification.id + 1}: ${notification.value}`;
      }, '')
    );
  }

  /**
   * Sets the component in the initialization error state.
   */
  setInitializationError() {
    this.hasInitializationError = true;
  }
}

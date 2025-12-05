// @ts-nocheck
import { LightningElement, api } from 'lwc';
import closeNotification from '@salesforce/label/c.quantic_CloseNotification';

export default class CustomHtmlNotification extends LightningElement {
  labels = {
    closeNotification,
  };

  _notifications = [];
  @api 
  set notifications(value) {
    console.log('CustomHtmlNotification set notifications called with value:', value);
    try {
      this._notifications = JSON.parse(value);
    } catch (err) {
      this._notifications = [];
    }
  }
  get notifications() {
    return this._notifications;
  }

  @api
  setNotifications(notifications) {
    console.log('CustomHtmlNotification setNotifications called with notifications:', notifications);
    try {
      this._notifications = JSON.parse(notifications);
    } catch (err) {
      this._notifications = [];
    }
  }

  handleNotificationClose(event) {
    const currentNotificationId = event.currentTarget.dataset.id;
    this._notifications = this._notifications.map((notification) => {
      if (notification.id.toString() === currentNotificationId) {
        return {...notification, visible: false};
      }
      return notification;
    });
  }
}
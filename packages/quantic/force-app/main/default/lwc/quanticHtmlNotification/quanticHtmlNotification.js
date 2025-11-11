import { LightningElement, api } from 'lwc';

export default class QuanticHtmlNotification extends LightningElement {
  @api 
  get notificationContent() {
    return this._notificationContent;
  }
  set notificationContent(value) {
    console.log('QuanticHtmlNotification set notificationContent called with value:', value);
    this._notificationContent = value;
  }

  connectedCallback() {
    this.template.addEventListener('htmlnotificationregister', this.handleRegistration);
  }

  disconnectedCallback() {
    this.template.removeEventListener('htmlnotificationregister', this.handleRegistration);
  }

  handleRegistration = (event) => {
    console.log('QuanticHtmlNotification handleRegistration called');
    console.log('QuanticHtmlNotification _notificationContent:', this._notificationContent);
    event.stopPropagation();
    const register = event?.detail?.register;
    if (typeof register === 'function') {
      register({
        content: this._notificationContent,
      });
    }
  }
}
import { LightningElement, track } from 'lwc';

export default class CustomHtmlNotification extends LightningElement {

  @track notificationContent;

  connectedCallback() {
    console.log('CustomHtmlNotification connectedCallback');
    const registerEvent = new CustomEvent('htmlnotificationregister', {
      detail: {
        register: (content) => {
          console.log('CustomHtmlNotification register called with content:', content);
          // Parent called us back with content
          this.notificationContent = content;
        },
      },
      bubbles: true,
      composed: true,
    });
    this.dispatchEvent(registerEvent);
  }

  get notificationText() {
    return this?.notificationContent?.content;
  }
}
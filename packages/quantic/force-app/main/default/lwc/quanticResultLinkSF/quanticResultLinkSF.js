import {NavigationMixin} from 'lightning/navigation';
import {LightningElement, api, wire, track} from 'lwc';

export default class QuanticResultLinkSF extends NavigationMixin(
  LightningElement
) {
  openPrimaryTab() {
    this[NavigationMixin.Navigate](
      {
        type: 'standard__navItemPage',
        attributes: {
          apiName: 'Home', // replace with the API name of the page you want to open in a new tab
        },
        state: {
          // any state parameters you want to pass to the page
        },
      },
      {
        target: '_blank',
      }
    );
  }

  handleButtonClick() {
    this.openPrimaryTab();
  }
}

import { NavigationMixin } from 'lightning/navigation';
import { LightningElement } from 'lwc';


export default class QuanticResultLinkSf extends NavigationMixin(LightningElement) {
  openPrimaryTab() {
    this[NavigationMixin.Navigate](
      {
        type: 'standard__navItemPage',
        attributes: {
          recordId: '5005200000BTn71AAD',
          objectApiName: 'yourObjectApiName',
          actionName: 'view',
          navigationLocation: 'LOOKUP',
          inConsole: true, // to check if console or community
        },
      },
      {
        target: '_blank',
      }
    );
  }

  handleLinkClick(event) {
    event.stopPropagation();
    this.openPrimaryTab();
  }
}
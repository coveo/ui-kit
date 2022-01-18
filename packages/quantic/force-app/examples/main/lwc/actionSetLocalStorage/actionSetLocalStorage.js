import { api, LightningElement } from "lwc";

export default class ActionSetLocalStorage extends LightningElement {
  @api engineId;
  @api standaloneSearchBox=false;

  input;

  localStorageKey = this.standaloneSearchBox ? 'coveo-standalone-search-box' : 'quantic-recent-results-list-engine_quantic-recent-results';
  recentResultList = [
    {
      title: 'test1',
      uri: 'https://github.com/coveo/ui-kit/',
      uniqueId: '1',
      clickUri: 'https://github.com/coveo/ui-kit/',
      raw: {
        urihash: '1',
      },
    },
    {
      title: 'test2',
      uri: 'https://github.com/coveo/ui-kit/',
      uniqueId: '2',
      clickUri: 'https://github.com/coveo/ui-kit/',
      raw: {
        urihash: '2',
      },
    },
  ];

  setItems() {
    if(this.standaloneSearchBox) {
      this.input =  this.template.querySelector('lightning-input');
    }
    const value = this.standaloneSearchBox ? this.input.value : this.recentResultList;
    localStorage.setItem(this.localStorageKey, JSON.stringify(value));
  }

  clear() {
    localStorage.setItem(this.localStorageKey, '[]');
  }
}
import {api, LightningElement} from 'lwc';

export default class ActionSetLocalStorage extends LightningElement {
  @api engineId;

  localStorageKey = 'quantic-recent-results-list-engine_quantic-recent-results';
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
    localStorage.setItem(
      this.localStorageKey,
      JSON.stringify(this.recentResultList)
    );
  }

  clear() {
    localStorage.setItem(this.localStorageKey, '[]');
  }
}

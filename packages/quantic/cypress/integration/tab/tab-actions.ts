import {TabSelector, TabSelectors} from './tab-selectors';

function tabActions(selector: TabSelector) {
  return {
    selectTab: (value: string) => {
      selector.tab().contains(value).click();
    },
    selectButton: (value: string) => {
      selector.button().contains(value).click();
    },
  };
}

export const TabActions = {
  ...tabActions(TabSelectors),
};

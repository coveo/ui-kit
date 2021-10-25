import {TabSelector, TabSelectors} from './tab-selectors';

function tabActions(selector: TabSelector) {
  return {
    selectTab: (value: string) => {
      selector.tab().contains(value).click();
    },
  };
}

export const TabActions = {
  ...tabActions(TabSelectors),
};

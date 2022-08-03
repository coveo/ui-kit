import {TabSelector, TabSelectors} from './tab-selectors';

function tabActions(selector: TabSelector) {
  return {
    selectTab: (value: string, keyPress?: string) => {
      if (!keyPress) {
        selector.tab().contains(value).click();
      } else selector.tab().contains(value).type(keyPress);
    },
    findTabPressTabPressSpace: (value: string) => {
      selector.tab().contains(value).tab().type(' ');
    },
    findTabPressShiftTabPressSpace: (value: string) => {
      selector.tab().contains(value).tab({shift: true}).type(' ');
    },
  };
}

export const TabActions = {
  ...tabActions(TabSelectors),
};

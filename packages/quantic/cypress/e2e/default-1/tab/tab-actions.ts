import {TabSelector, TabSelectors} from './tab-selectors';

function tabActions(selector: TabSelector) {
  return {
    selectTab: (value: string, keyPress?: string) => {
      if (keyPress) {
        selector.tab().contains(value).type(keyPress);
      } else {
        selector.tab().contains(value).click();
      }
    },
    findTabPressTabPressSpace: (value: string) => {
      selector.tab().contains(value).realPress('Tab');
      selector.tab().contains(value).type(' ');
    },
    findTabPressShiftTabPressSpace: (value: string) => {
      selector.tab().contains(value).realPress(['Shift', 'Tab']);
      selector.tab().contains(value).type(' ');
    },
  };
}

export const TabActions = {
  ...tabActions(TabSelectors),
};

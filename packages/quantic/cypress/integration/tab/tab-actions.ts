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
      // .tab() is equivalent to pressing the Tab; .type(' ') is equivalent to pressing the space bar;
      selector.tab().contains(value).tab().type(' ');
    },
    findTabPressShiftTabPressSpace: (value: string) => {
      // tab({shift: true}) is equivalent to pressing the Shift and the Tab; .type(' ') is equivalent to pressing the space bar;
      selector.tab().contains(value).tab({shift: true}).type(' ');
    },
  };
}

export const TabActions = {
  ...tabActions(TabSelectors),
};

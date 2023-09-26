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
      // This is equivalent to pressing the Tab key twice and then pressing the Space bar.
      cy.realPress(['Tab', 'Tab', 'Space']).contains(value);
    },
    findTabPressShiftTabPressSpace: (value: string) => {
      // This is equivalent to holding the Shift key while pressing the Tab key twice and then pressing the Space bar.
      selector;
      cy.realPress(['Shift', 'Tab', 'Tab', 'Space']).contains(value);
    },
  };
}

export const TabActions = {
  ...tabActions(TabSelectors),
};

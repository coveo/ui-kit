import {TabSelector, TabSelectors} from './tab-selectors';

function tabActions(selector: TabSelector) {
  return {
    selectTab: (value: string) => {
      selector.tab().contains(value).click();
    },
    selectButton: (value: string) => {
      selector.button().contains(value).click();
    },
    tabAndSelectNextButton: (value: string) => {
      selector.button().contains(value).tab().type(' ');
    },
    tabAndSelectPreviousButton: (value: string) => {
      selector.button().contains(value).tab({shift: true}).type(' ');
    },

    keyPressButton: (value: string, input = ' ') => {
      selector.button().contains(value).type(input);
    },
  };
}

export const TabActions = {
  ...tabActions(TabSelectors),
};

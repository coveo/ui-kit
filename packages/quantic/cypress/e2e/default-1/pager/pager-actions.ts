import {PagerSelector, PagerSelectors} from './pager-selectors';

function pagerActions(selector: PagerSelector) {
  return {
    clickNext: () => selector.next().click(),
    clickPrevious: () => selector.previous().click(),
    selectPage: (value: number) => selector.page().contains(value).click(),
  };
}

export const PagerActions = {
  ...pagerActions(PagerSelectors),
};

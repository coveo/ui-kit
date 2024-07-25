import {Selector, SelectorsFactory} from './selectors';

export const searchInterfaceComponent = 'c-quantic-search-interface';
export const insightInterfaceComponent = 'c-quantic-insight-interface';

function actions(selector: Selector) {
  return {
    typeInSearchbox: (text: string) => selector.searchbox().type(text),
    submitQuery: () => selector.searchbox().trigger('keydown', {key: 'Enter'}),
    selectFacetValue: (value: string) =>
      selector.facetValue(value).check({force: true}),
    selectPagerButton: (index: number) => selector.pagerButton(index).click(),
    openSortDropdown: () => selector.sortDropdown().click(),
    selectSortOption: (value: string) =>
      selector.sortOption(value).trigger('mouseover', {force: true}).click(),
    clickRefineToggle: () => selector.refineToggle().click(),
  };
}

export const SearchActions = {
  ...actions(SelectorsFactory(searchInterfaceComponent)),
};

export const InsightActions = {
  ...actions(SelectorsFactory(insightInterfaceComponent)),
};

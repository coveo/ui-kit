import {
  PlaceholderSelector,
  PlaceholderSelectors,
} from './placeholder-selectors';

function placeholderExpectations(selector: PlaceholderSelector) {
  return {
    displayResultListPlaceholder: (display: boolean) => {
      selector.resultListPlaceholder().should(display ? 'exist' : 'not.exist');
    },
    displayResultPlaceholders: (value: number) => {
      selector.resultPlaceholder().should('have.length', value);
    },
    displayCardPlaceholder: (display: boolean) => {
      selector.cardPlaceholder().should(display ? 'exist' : 'not.exist');
    },
    displayCardRowPlaceholders: (value: number) => {
      selector.cardRowPlaceholder().should('have.length', value);
    },
  };
}

export const PlaceholderExpectations = {
  ...placeholderExpectations(PlaceholderSelectors),
};

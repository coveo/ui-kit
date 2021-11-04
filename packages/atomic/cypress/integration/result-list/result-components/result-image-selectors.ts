import {ResultListSelectors} from '../result-list-selectors';

export const resultImageComponent = 'atomic-result-image';

export const ResultImageSelectors = {
  shadow: () => cy.get(resultImageComponent),
  firstInResult: () =>
    ResultListSelectors.firstResult().find(resultImageComponent),
  resultImage: () =>
    ResultImageSelectors.firstInResult().find('[part="result-image"]'),
};

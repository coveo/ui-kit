export const ResultListSelectors = {
  component: 'atomic-result-list',
  placeholder: 'atomic-result-list-placeholder',
  result: 'atomic-result',
};

export const resultListComponent = (slot = '') =>
  `<${ResultListSelectors.component}>${slot}</${ResultListSelectors.component}>`;

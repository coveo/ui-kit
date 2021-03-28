export const ResultTemplateSelectors = {
  component: 'atomic-result-template',
};

export const resultTemplateComponent = (slot = '') =>
  `<${ResultTemplateSelectors.component}>${slot}</${ResultTemplateSelectors.component}>`;

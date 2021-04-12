export const ResultTemplateSelectors = {
  component: 'atomic-result-template',
};

export const resultTemplateComponent = (slot = '', attributes = '') =>
  `<${ResultTemplateSelectors.component} ${attributes}>${slot}</${ResultTemplateSelectors.component}>`;

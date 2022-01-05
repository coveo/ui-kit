import {
  ResultTemplateSelector,
  ResultTemplateSelectors,
} from './result-template-selectors';

const resultTemplateActions = (selector: ResultTemplateSelector) => {
  return {
    appendChildren: (tagElement: string, props: any = {}) => {
      selector.get().then((element) => {
        const e = document.createElement(tagElement);
        for (const [k, v] of Object.entries(props)) {
          e.setAttribute(k, v.toString());
        }
        element.append(e);
      });
    },
  };
};

export const ResultTemplateActions = {
  ...resultTemplateActions(ResultTemplateSelectors),
};

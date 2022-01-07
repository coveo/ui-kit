import {
  ResultTemplateSelector,
  ResultTemplateSelectors,
} from './result-template-selectors';

const resultTemplateActions = (selector: ResultTemplateSelector) => {
  return {
    appendChildren: (
      tagElement: string,
      props: any = {},
      innerHtml?: string
    ) => {
      selector
        .get()
        .then((element) => {
          const e = document.createElement(tagElement);
          for (const [k, v] of Object.entries(props)) {
            e.setAttribute(k, v.toString());
          }
          if (innerHtml) e.innerHTML = innerHtml;
          element.append(e);
        })
        .logAction('Insert Html');
    },
  };
};

export const ResultTemplateActions = {
  ...resultTemplateActions(ResultTemplateSelectors),
};

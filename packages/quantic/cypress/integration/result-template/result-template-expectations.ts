import {should} from '../common-selectors';
import {
  ResultTemplateSelector,
  ResultTemplateSelectors,
} from './result-template-selectors';

function resultTemplateExpectations(selector: ResultTemplateSelector) {
  return {
    displaySlotByName: (name: string, display: boolean) => {
      selector
        .slotByName(name)
        .should(display ? 'exist' : 'not.exist')
        .logDetail(
          `${should(display)} display the element by name equal "${name}"`
        );
    },
  };
}

export const ResultTemplateExpectations = {
  ...resultTemplateExpectations(ResultTemplateSelectors),
};

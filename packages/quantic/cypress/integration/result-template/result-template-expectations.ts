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
        .logDetail(`${should(display)} display the element named "${name}"`);
    },
    numberOfSlotsByName: (name: string, length: number) => {
      selector
        .slotByName(name)
        .should('have.length', length)
        .logDetail(`should display ${length} slots`);
    },
  };
}

export const ResultTemplateExpectations = {
  ...resultTemplateExpectations(ResultTemplateSelectors),
};

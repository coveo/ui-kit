import {InterceptAliases} from '../../page-objects/search';
import {should} from '../common-selectors';
import {EventExpectations} from '../event-expectations';
import {
  ResultQuickviewSelector,
  ResultQuickviewSelectors,
} from './result-quickview-selectors';

function resultQuickviewExpectations(selector: ResultQuickviewSelector) {
  return {
    displayButtonPreview: (display: boolean, variant?: string) => {
      selector
        .buttonPreview(variant)
        .should(display ? 'exist' : 'not.exist')
        .logDetail(`${should(display)} display the button preview`);
    },
    isDisabled: (disabled: boolean, variant?: string) => {
      selector
        .buttonPreview(variant)
        .invoke('attr', 'disabled')
        .should('deep.equal', disabled)
        .logDetail(`${should(disabled)} be disabled the button preview`);
    },
    displaySectionPreview: (display: boolean) => {
      selector
        .sectionPreview()
        .should(display ? 'exist' : 'not.exist')
        .logDetail(`${should(display)} display the section preview`);
    },
    logDocumentQuickview: (field: string, title: string) => {
      cy.wait(InterceptAliases.UA.DocumentQuickview)
        .then((interception) => {
          const analyticsBody = interception.request.body;
          expect(analyticsBody).to.have.property(
            'actionCause',
            'documentQuickview'
          );
          expect(analyticsBody).to.have.property('documentTitle', title);
        })
        .logDetail('should log the "documentQuickview" UA event');
    },
  };
}

export const ResultQuickviewExpectations = {
  ...resultQuickviewExpectations(ResultQuickviewSelectors),
  events: {
    ...EventExpectations,
  },
};

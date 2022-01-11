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
    displayButtonPreviewIcon: (display: boolean) => {
      selector
        .buttonPreviewIcon()
        .should(display ? 'exist' : 'not.exist')
        .logDetail(`${should(display)} display the icon in button preview`);
    },
    buttonPreviewIsDisabled: (disabled: boolean, variant?: string) => {
      selector
        .buttonPreview(variant)
        .invoke('attr', 'disabled')
        .should(disabled ? 'exist' : 'not.exist')
        .logDetail(`The button preview ${should(disabled)} be disabled`);
    },
    displaySectionPreview: (display: boolean) => {
      selector
        .sectionPreview()
        .should(display ? 'exist' : 'not.exist')
        .logDetail(`${should(display)} display the section preview`);
    },
    displayTitle: (display: boolean) => {
      selector
        .title()
        .should(display ? 'exist' : 'not.exist')
        .logDetail(`${should(display)} display the title`);
    },
    displayDate: (display: boolean) => {
      selector
        .resultDate()
        .should(display ? 'exist' : 'not.exist')
        .logDetail(`${should(display)} display the result date`);
    },
    buttonPreviewContains: (label: string) => {
      selector
        .buttonPreview()
        .contains(label)
        .logDetail(`The button preview should contain "${label}"`);
    },
    logDocumentQuickview: (title: string) => {
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

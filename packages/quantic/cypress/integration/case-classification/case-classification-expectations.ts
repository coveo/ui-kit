import {InterceptAliases} from '../../page-objects/search';
import {should} from '../common-selectors';
import {ConsoleExpectations} from '../console-expectations';
import {
  CaseClassificationSelector,
  CaseClassificationSelectors,
} from './case-classification-selectors';

function caseClassificationExpectations(selector: CaseClassificationSelector) {
  return {
    displayLabel: (display: boolean) => {
      selector
        .label()
        .should(display ? 'exist' : 'not.exist')
        .logDetail(`${should(display)} display the label`);
    },

    displaySelectTitle: (display: boolean) => {
      selector
        .selectTitle()
        .should(display ? 'exist' : 'not.exist')
        .logDetail(`${should(display)} display the select title`);
    },

    displaySelectInput: (display: boolean) => {
      selector
        .selectInput()
        .should(display ? 'exist' : 'not.exist')
        .logDetail(`${should(display)} display the select input`);
    },

    displayError: (display: boolean) => {
      selector
        .error()
        .should(display ? 'exist' : 'not.exist')
        .logDetail(`${should(display)} display the error`);
    },

    hideSuggestions: (hidden: boolean) => {
      selector
        .suggestedOptions()
        .should(
          hidden ? 'have.class' : 'not.have.class',
          'visual-picker__hidden'
        )
        .logDetail(`${should(hidden)} hide the suggested options`);
    },

    numberOfSuggestions: (value: number) => {
      selector
        .suggestedOptions()
        .should('have.length', value)
        .logDetail(`should display ${value} suggested options`);
    },

    numberOfInlineOptions: (value: number) => {
      selector
        .inlineOptions()
        .should('have.length', value)
        .logDetail(`should display ${value} suggested options`);
    },

    logUpdatedClassificationFromSuggestion: (field: string, index: number) => {
      cy.wait(InterceptAliases.UA.CaseAssist.FieldUpdate).then(
        (interception) => {
          const analyticsBody = interception.request.body;
          selector
            .suggestedOptionInput(index)
            .invoke('attr', 'value')
            .should('eq', analyticsBody.svc_ticket_custom[field]);
        }
      );
    },

    logUpdatedClassificationFromSelectOption: (
      field: string,
      index: number
    ) => {
      cy.wait(InterceptAliases.UA.CaseAssist.FieldUpdate).then(
        (interception) => {
          const analyticsBody = interception.request.body;
          selector
            .selectOption(index)
            .invoke('attr', 'data-value')
            .should('eq', analyticsBody.svc_ticket_custom[field]);
        }
      );
    },

    logUpdatedClassificationFromInlineOption: (
      field: string,
      index: number
    ) => {
      cy.wait(InterceptAliases.UA.CaseAssist.FieldUpdate).then(
        (interception) => {
          const analyticsBody = interception.request.body;
          selector
            .inlineOptionInput(index)
            .invoke('attr', 'value')
            .should('eq', analyticsBody.svc_ticket_custom[field]);
        }
      );
    },

    logClickedSuggestions: (value: number) => {
      cy.wait(InterceptAliases.UA.CaseAssist.ClassificationClick).then(
        (interception) => {
          const analyticsBody = interception.request.body;
          selector
            .suggestedOptionInput(value)
            .invoke('attr', 'data-suggestion-id')
            .should('eq', analyticsBody.svc_action_data.classificationId);
        }
      );
    },
  };
}

export const CaseClassificationExpectations = {
  ...caseClassificationExpectations(CaseClassificationSelectors),
  console: {
    ...ConsoleExpectations,
  },
};

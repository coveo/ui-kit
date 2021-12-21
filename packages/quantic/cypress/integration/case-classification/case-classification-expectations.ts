import {InterceptAliases} from '../../page-objects/search';
import {should} from '../common-selectors';
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

    displayLoading: (display: boolean) => {
      selector
        .loadingSpinner()
        .should(display ? 'exist' : 'not.exist')
        .logDetail(`${should(display)} display the loading spinner`);
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
        .logDetail(`should display ${value} inline options`);
    },

    logUpdatedClassificationFromSuggestion: (field: string, index: number) => {
      cy.wait(InterceptAliases.UA.CaseAssist.FieldUpdate)
        .then((interception) => {
          const analyticsBody = interception.request.body;
          selector
            .suggestedOptionInput(index)
            .invoke('attr', 'value')
            .should(
              'eq',
              analyticsBody.svc_ticket_custom[`sf${field.toLowerCase()}`]
            );
        })
        .logDetail('should log the "ticket_field_update" UA event');
    },

    logUpdatedClassificationFromSelectOption: (
      field: string,
      index: number
    ) => {
      cy.wait(InterceptAliases.UA.CaseAssist.FieldUpdate)
        .then((interception) => {
          const analyticsBody = interception.request.body;
          selector
            .selectOption(index)
            .invoke('attr', 'data-value')
            .should(
              'eq',
              analyticsBody.svc_ticket_custom[`sf${field.toLowerCase()}`]
            );
        })
        .logDetail('should log the "ticket_field_update" UA event');
    },

    logUpdatedClassificationFromInlineOption: (
      field: string,
      index: number
    ) => {
      cy.wait(InterceptAliases.UA.CaseAssist.FieldUpdate)
        .then((interception) => {
          const analyticsBody = interception.request.body;
          selector
            .inlineOptionInput(index)
            .invoke('attr', 'value')
            .should(
              'eq',
              analyticsBody.svc_ticket_custom[`sf${field.toLowerCase()}`]
            );
        })
        .logDetail('should log the "ticket_field_update" UA event');
    },

    logClickedSuggestions: (value: number) => {
      cy.wait(InterceptAliases.UA.CaseAssist.ClassificationClick)
        .then((interception) => {
          const analyticsBody = interception.request.body;
          selector
            .suggestedOptionInput(value)
            .invoke('attr', 'data-suggestion-id')
            .should('eq', analyticsBody.svc_action_data.classificationId);
        })
        .logDetail('should log the "ticket_classification_click" UA event');
    },
  };
}

export const CaseClassificationExpectations = {
  ...caseClassificationExpectations(CaseClassificationSelectors),
};

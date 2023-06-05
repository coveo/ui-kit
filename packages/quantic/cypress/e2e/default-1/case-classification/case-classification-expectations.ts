import {InterceptAliases} from '../../../page-objects/case-assist';
import {ComponentErrorExpectations} from '../../common-expectations';
import {should} from '../../common-selectors';
import {ConsoleExpectations} from '../../console-expectations';
import {
  CaseClassificationSelector,
  CaseClassificationSelectors,
} from './case-classification-selectors';

const testOrigin = 'test origin';

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

    correctSugestionsOrder: (suggestions: Array<{value: string}>) => {
      suggestions.forEach((suggestion, idx) => {
        selector
          .suggestedOption(idx)
          .should('have.text', suggestion.value)
          .logDetail('should display in the correct order');
      });
    },

    numberOfInlineOptions: (value: number) => {
      selector
        .inlineOptions()
        .should('have.length', value)
        .logDetail(`should display ${value} inline options`);
    },

    correctValue: (value: string) => {
      selector
        .get()
        .should('have.value', value)
        .logDetail(`should have the following value: "${value}"`);
    },

    logUpdatedClassificationFromSuggestion: (field: string, index: number) => {
      cy.wait(InterceptAliases.UA.FieldUpdate)
        .then((interception) => {
          const analyticsBody = interception.request.body;
          selector
            .suggestedOptionInput(index)
            .invoke('attr', 'value')
            .should('eq', analyticsBody.svc_ticket_custom[field]);
          expect(analyticsBody.searchHub).to.eq(testOrigin);
        })
        .logDetail('should log the "ticket_field_update" UA event');
    },

    logDeselect: (field: string) => {
      cy.wait(InterceptAliases.UA.FieldUpdate)
        .then((interception) => {
          const analyticsBody = interception.request.body;
          expect(analyticsBody.svc_action_data).to.have.property(
            'fieldName',
            field
          );
          expect(analyticsBody.svc_ticket_custom).not.to.have.property(field);
          expect(analyticsBody.searchHub).to.eq(testOrigin);
        })
        .logDetail('should log the "ticket_field_update" UA event');
    },

    logUpdatedClassificationFromSelectOption: (
      field: string,
      index: number
    ) => {
      cy.wait(InterceptAliases.UA.FieldUpdate)
        .then((interception) => {
          const analyticsBody = interception.request.body;
          selector
            .selectOption(index)
            .invoke('attr', 'data-value')
            .should('eq', analyticsBody.svc_ticket_custom[field]);
          expect(analyticsBody.searchHub).to.eq(testOrigin);
        })
        .logDetail('should log the "ticket_field_update" UA event');
    },

    logUpdatedClassificationFromInlineOption: (
      field: string,
      index: number
    ) => {
      cy.wait(InterceptAliases.UA.FieldUpdate)
        .then((interception) => {
          const analyticsBody = interception.request.body;
          selector
            .inlineOptionInput(index)
            .invoke('attr', 'value')
            .should('eq', analyticsBody.svc_ticket_custom[field]);
          expect(analyticsBody.searchHub).to.eq(testOrigin);
        })
        .logDetail('should log the "ticket_field_update" UA event');
    },

    logClickedSuggestion: (index: number, autoSelection = false) => {
      cy.wait(InterceptAliases.UA.ClassificationClick)
        .then((interception) => {
          const analyticsBody = interception.request.body;
          selector
            .suggestedOptionInput(index)
            .invoke('attr', 'data-suggestion-id')
            .should('eq', analyticsBody.svc_action_data.classificationId);
          expect(analyticsBody.searchHub).to.eq(testOrigin);
          if (autoSelection) {
            expect(analyticsBody.svc_action_data).to.have.property(
              'autoSelection',
              true
            );
          }
        })
        .logDetail('should log the "ticket_classification_click" UA event');
    },

    fetchClassifications: () => {
      cy.wait(InterceptAliases.CaseClassification).logDetail(
        'should fetch new case classifications'
      );
    },

    fetchDocumentSuggestions: () => {
      cy.wait(InterceptAliases.DocumentSuggestion).logDetail(
        'should fetch new document suggestions'
      );
    },
  };
}

export const CaseClassificationExpectations = {
  ...caseClassificationExpectations(CaseClassificationSelectors),
  ...ComponentErrorExpectations(CaseClassificationSelectors),
  console: {
    ...ConsoleExpectations,
  },
};

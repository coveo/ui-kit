import {configure} from '../../page-objects/configurator';
import {
  interceptSearch,
  mockCaseClassification,
} from '../../page-objects/search';
import {CaseClassificationExpectations as Expect} from './case-classification-expectations';
import {CaseClassificationActions as Actions} from './case-classification-actions';
import {scope} from '../../reporters/detailed-collector';
import {fetchClassifications} from '../../page-objects/actions/action-fetch-classifications';

interface CaseClassificationOptions {
  maxChoices: number;
  label: string;
  required: boolean;
  selectPlaceholder: string;
  messageWhenValueMissing: string;
}

describe('quantic-case-classification', () => {
  const pageUrl = 's/quantic-case-classification';

  const defaultField = 'sfpriority';
  const defaultMaxOptions = 4;
  const suggestions = [
    {id: '0', value: 'Very low'},
    {id: '1', value: 'Low'},
    {id: '2', value: 'Medium'},
    {id: '3', value: 'High'},
  ];

  function visitCaseClassification(
    options: Partial<CaseClassificationOptions>
  ) {
    interceptSearch();
    cy.visit(pageUrl);
    configure(options);
  }

  describe('with default options', () => {
    it('should work as expected', () => {
      visitCaseClassification({
        maxChoices: defaultMaxOptions,
      });

      scope('when loading the page', () => {
        Expect.displayLabel(true);
        Expect.numberOfInlineOptions(0);
        Expect.numberOfSuggestions(0);
        Expect.displaySelectTitle(false);
        Expect.displaySelectInput(true);
      });

      scope('when fetching and selecting a suggestion', () => {
        const nbSuggestions = 2;
        const clickedIndex = 0;
        mockCaseClassification(
          defaultField,
          suggestions.slice(0, nbSuggestions)
        );
        fetchClassifications();
        Expect.displaySelectTitle(true);
        Expect.numberOfSuggestions(nbSuggestions);
        Expect.numberOfInlineOptions(0);
        Actions.clickSuggestion(clickedIndex);
        Expect.logClickedSuggestions(clickedIndex);
        Expect.logUpdatedClassificationFromSuggestion(
          defaultField,
          clickedIndex
        );
      });

      scope(
        'when fetching and selecting an option from the select input',
        () => {
          const nbSuggestions = 2;
          const clickedIndex = 3;
          mockCaseClassification(
            defaultField,
            suggestions.slice(0, nbSuggestions)
          );
          fetchClassifications();
          Expect.displaySelectTitle(true);
          Expect.numberOfSuggestions(nbSuggestions);
          Expect.numberOfInlineOptions(0);
          Actions.clickSelectTitle();
          Actions.openSelectInput();
          Actions.clickSelectOption(clickedIndex);
          Expect.hideSuggestions(true);
          Expect.logUpdatedClassificationFromSelectOption(
            defaultField,
            clickedIndex
          );
        }
      );
    });
  });

  describe('with maxChoices set to 1', () => {
    it('should work as expected', () => {
      visitCaseClassification({
        maxChoices: 1,
      });

      scope('when loading the page', () => {
        Expect.displayLabel(true);
        Expect.numberOfInlineOptions(0);
        Expect.numberOfSuggestions(0);
        Expect.displaySelectTitle(false);
        Expect.displaySelectInput(true);
      });

      scope('when fetching suggestions', () => {
        const nbSuggestions = 2;
        mockCaseClassification(
          defaultField,
          suggestions.slice(0, nbSuggestions)
        );
        fetchClassifications();
        Expect.displaySelectTitle(false);
        Expect.numberOfSuggestions(0);
        Expect.numberOfInlineOptions(0);
        Expect.displaySelectInput(true);
      });
    });
  });
});

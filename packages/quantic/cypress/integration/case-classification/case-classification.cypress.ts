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

      scope('when fetching suggestions', () => {
        const suggestionsCount = 2;
        mockCaseClassification(
          defaultField,
          suggestions.slice(0, suggestionsCount)
        );
        fetchClassifications();
        Expect.displaySelectTitle(true);
        Expect.displaySelectInput(false);
        Expect.numberOfSuggestions(suggestionsCount);
        Expect.numberOfInlineOptions(0);
      });

      scope('when selecting a suggestion', () => {
        const clickedIndex = 0;

        Actions.clickSuggestion(clickedIndex);
        Expect.logClickedSuggestions(clickedIndex);
        Expect.logUpdatedClassificationFromSuggestion(
          defaultField,
          clickedIndex
        );
      });

      scope('when selecting an option from the select input', () => {
        const clickedIndex = 3;

        Actions.clickSelectTitle();
        Actions.openSelectInput();
        Actions.clickSelectOption(clickedIndex);
        Expect.hideSuggestions(true);
        Expect.logUpdatedClassificationFromSelectOption(
          defaultField,
          clickedIndex
        );
      });
    });
  });

  describe('when no suggestions are found', () => {
    it('should display only the select dropdown', () => {
      visitCaseClassification({
        maxChoices: defaultMaxOptions,
      });

      scope('when loading the page', () => {
        Expect.numberOfInlineOptions(0);
        Expect.numberOfSuggestions(0);
        Expect.displaySelectTitle(false);
        Expect.displaySelectInput(true);
      });

      scope('when fetching suggestions', () => {
        mockCaseClassification(defaultField, []);
        fetchClassifications();
        Expect.displaySelectTitle(false);
        Expect.displaySelectInput(true);
        Expect.numberOfSuggestions(0);
        Expect.numberOfInlineOptions(0);
      });
    });
  });

  describe('with maxChoices set to 1', () => {
    it('should display only the select dropdown', () => {
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
        const suggestionsCount = 2;
        mockCaseClassification(
          defaultField,
          suggestions.slice(0, suggestionsCount)
        );
        fetchClassifications();
        Expect.displaySelectTitle(false);
        Expect.numberOfSuggestions(0);
        Expect.numberOfInlineOptions(0);
        Expect.displaySelectInput(true);
      });

      scope('when selecting an option from the select input', () => {
        const clickedIndex = 3;

        Actions.openSelectInput();
        Actions.clickSelectOption(clickedIndex);
        Expect.logUpdatedClassificationFromSelectOption(
          defaultField,
          clickedIndex
        );
      });
    });
  });

  describe('with invalid number of maxChoices', () => {
    it('should display only the select drop down when the maxChoices is set to 0', () => {
      visitCaseClassification({
        maxChoices: 0,
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

    it('should display the select drop down when the maxChoices is inferior to 0', () => {
      visitCaseClassification({
        maxChoices: -1,
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

  describe('with max choices set to the number of options', () => {
    const optionsCount = 5;
    it('should display all the options as inline options', () => {
      visitCaseClassification({
        maxChoices: optionsCount,
      });

      scope('when loading the page', () => {
        Expect.displayLabel(true);
        Expect.numberOfInlineOptions(optionsCount);
        Expect.numberOfSuggestions(0);
        Expect.displaySelectTitle(false);
        Expect.displaySelectInput(false);
      });

      scope('when fetching suggestions', () => {
        const suggestionsCount = 2;
        mockCaseClassification(
          defaultField,
          suggestions.slice(0, suggestionsCount)
        );
        fetchClassifications();
        Expect.displaySelectTitle(false);
        Expect.numberOfSuggestions(2);
        Expect.numberOfInlineOptions(3);
        Expect.displaySelectInput(false);
      });

      scope('when selecting a suggestion', () => {
        const clickedIndex = 0;

        Actions.clickSuggestion(clickedIndex);
        Expect.logClickedSuggestions(clickedIndex);
        Expect.logUpdatedClassificationFromSuggestion(
          defaultField,
          clickedIndex
        );
      });

      scope('when selecting an inline option', () => {
        const clickedIndex = 0;

        Actions.clickInlineOption(clickedIndex);
        Expect.logUpdatedClassificationFromInlineOption(
          defaultField,
          clickedIndex
        );
      });
    });
  });

  describe('with max choices greater than the number of options', () => {
    const optionsCount = 5;
    it('should display all the options as inline options', () => {
      visitCaseClassification({
        maxChoices: optionsCount + 1,
      });

      scope('when loading the page', () => {
        Expect.displayLabel(true);
        Expect.numberOfInlineOptions(optionsCount);
        Expect.numberOfSuggestions(0);
        Expect.displaySelectTitle(false);
        Expect.displaySelectInput(false);
      });

      scope('when fetching suggestions', () => {
        const suggestionsCount = 2;
        mockCaseClassification(
          defaultField,
          suggestions.slice(0, suggestionsCount)
        );
        fetchClassifications();
        Expect.displaySelectTitle(false);
        Expect.numberOfSuggestions(2);
        Expect.numberOfInlineOptions(3);
        Expect.displaySelectInput(false);
      });
    });
  });
});

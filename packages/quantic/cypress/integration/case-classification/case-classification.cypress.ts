import {configure} from '../../page-objects/configurator';
import {
  interceptSearch,
  mockCaseClassification,
  mockSfPicklistValues,
  interceptClassificationsIndefinitely,
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

  const defaultField = 'Priority';
  const defaultMaxChoices = 4;
  const allOptions = [
    {id: '0', value: 'Very low', label: 'Very low'},
    {id: '1', value: 'Low', label: 'Low'},
    {id: '2', value: 'Medium', label: 'Medium'},
    {id: '3', value: 'High', label: 'High'},
    {id: '4', value: 'Very high', label: 'Very high'},
  ];

  function visitCaseClassification(
    options: Partial<CaseClassificationOptions>
  ) {
    mockSfPicklistValues(defaultField, allOptions);
    interceptSearch();
    cy.visit(pageUrl);
    configure(options);
  }

  describe('with default options', () => {
    it('should work as expected', () => {
      visitCaseClassification({
        maxChoices: defaultMaxChoices,
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
          allOptions.slice(0, suggestionsCount)
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

  describe('when the suggestions are loading', () => {
    it('should display the loading spinner', () => {
      visitCaseClassification({
        maxChoices: defaultMaxChoices,
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
          allOptions.slice(0, suggestionsCount)
        );
        interceptClassificationsIndefinitely();
        fetchClassifications();
        Expect.displaySelectTitle(false);
        Expect.displaySelectInput(true);
        Expect.numberOfSuggestions(0);
        Expect.numberOfInlineOptions(0);
        Expect.displayLoading(true);
      });
    });
  });

  describe('when no suggestions are found', () => {
    it('should display only the select dropdown', () => {
      visitCaseClassification({
        maxChoices: defaultMaxChoices,
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
          allOptions.slice(0, suggestionsCount)
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
    it('should display only the select dropdown when maxChoices is set to 0', () => {
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
        const suggestionsCount = 2;
        mockCaseClassification(
          defaultField,
          allOptions.slice(0, suggestionsCount)
        );
        fetchClassifications();
        Expect.displaySelectTitle(false);
        Expect.numberOfSuggestions(0);
        Expect.numberOfInlineOptions(0);
        Expect.displaySelectInput(true);
      });
    });

    it('should display the select dropdown when maxChoices is inferior to 0', () => {
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
        const suggestionsCount = 2;
        mockCaseClassification(
          defaultField,
          allOptions.slice(0, suggestionsCount)
        );
        fetchClassifications();
        Expect.displaySelectTitle(false);
        Expect.numberOfSuggestions(0);
        Expect.numberOfInlineOptions(0);
        Expect.displaySelectInput(true);
      });
    });
  });

  describe('with maxChoices set to the number of options', () => {
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
          allOptions.slice(0, suggestionsCount)
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

  describe('with maxChoices greater than the number of options', () => {
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
          allOptions.slice(0, suggestionsCount)
        );
        fetchClassifications();
        Expect.displaySelectTitle(false);
        Expect.numberOfSuggestions(2);
        Expect.numberOfInlineOptions(3);
        Expect.displaySelectInput(false);
      });
    });
  });

  describe('when required is set to true', () => {
    it('should display an error when no option is selected', () => {
      visitCaseClassification({
        required: true,
      });

      scope('when reporting validity and no option is selected', () => {
        Actions.reportValidity();
        Expect.displayError(true);
      });

      scope('when reporting validity and an option is selected', () => {
        const clickedIndex = 3;

        Actions.openSelectInput();
        Actions.clickSelectOption(clickedIndex);
        Expect.logUpdatedClassificationFromSelectOption(
          defaultField,
          clickedIndex
        );
        Actions.reportValidity();
        Expect.displayError(false);
      });
    });

    it('should display an error when no suggestion is selected', () => {
      visitCaseClassification({
        required: true,
      });

      scope('when reporting validity and no suggestion is selected', () => {
        Actions.reportValidity();
        Expect.displayError(true);
      });

      scope('when reporting validity and a suggestion is selected', () => {
        const suggestionsCount = 2;
        const clickedIndex = 0;

        mockCaseClassification(
          defaultField,
          allOptions.slice(0, suggestionsCount)
        );
        fetchClassifications();

        Actions.clickSuggestion(clickedIndex);
        Expect.logClickedSuggestions(clickedIndex);
        Expect.logUpdatedClassificationFromSuggestion(
          defaultField,
          clickedIndex
        );

        Actions.reportValidity();
        Expect.displayError(false);
      });
    });
  });
});

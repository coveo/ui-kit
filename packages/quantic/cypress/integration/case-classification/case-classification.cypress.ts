import {configure} from '../../page-objects/configurator';
import {
  interceptCaseAssist,
  mockCaseClassification,
  mockSfPicklistValues,
  interceptClassificationsIndefinitely,
} from '../../page-objects/case-assist';
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

  const sfDefaultField = 'Priority';
  const coveoDefaultField = 'sfpriority';
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
    mockSfPicklistValues(sfDefaultField, allOptions);
    interceptCaseAssist();
    cy.visit(pageUrl);
    configure(options);
  }

  describe('when using default options', () => {
    it('should render the component and all parts', () => {
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
          coveoDefaultField,
          allOptions.slice(0, suggestionsCount)
        );
        fetchClassifications();
        Expect.displaySelectTitle(true);
        Expect.displaySelectInput(false);
        Expect.numberOfSuggestions(suggestionsCount);
        Expect.correctSugestionsOrder(allOptions.slice(0, suggestionsCount));
        Expect.numberOfInlineOptions(0);
      });

      scope('when selecting a suggestion', () => {
        const clickedIndex = 0;

        Actions.clickSuggestion(clickedIndex);
        Expect.logClickedSuggestion(clickedIndex);
        Expect.logUpdatedClassificationFromSuggestion(
          coveoDefaultField,
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
          coveoDefaultField,
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
          coveoDefaultField,
          allOptions.slice(0, suggestionsCount)
        );
        interceptClassificationsIndefinitely();
        fetchClassifications();
        Expect.displaySelectTitle(false);
        Expect.displaySelectInput(false);
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
        mockCaseClassification(coveoDefaultField, []);
        fetchClassifications();
        Expect.displaySelectTitle(false);
        Expect.displaySelectInput(true);
        Expect.numberOfSuggestions(0);
        Expect.numberOfInlineOptions(0);
      });
    });
  });

  describe('when maxChoices set to 1', () => {
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
          coveoDefaultField,
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
          coveoDefaultField,
          clickedIndex
        );
      });
    });
  });

  describe('when invalid number of maxChoices is given', () => {
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
          coveoDefaultField,
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
          coveoDefaultField,
          clickedIndex
        );
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
          coveoDefaultField,
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
          coveoDefaultField,
          clickedIndex
        );
      });
    });
  });

  describe('when maxChoices is set to the number of options', () => {
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
          coveoDefaultField,
          allOptions.slice(0, suggestionsCount)
        );
        fetchClassifications();
        Expect.displaySelectTitle(false);
        Expect.numberOfSuggestions(suggestionsCount);
        Expect.numberOfInlineOptions(allOptions.length - suggestionsCount);
        Expect.displaySelectInput(false);
      });

      scope('when selecting a suggestion', () => {
        const clickedIndex = 0;

        Actions.clickSuggestion(clickedIndex);
        Expect.logClickedSuggestion(clickedIndex);
        Expect.logUpdatedClassificationFromSuggestion(
          coveoDefaultField,
          clickedIndex
        );
      });

      scope('when selecting an inline option', () => {
        const clickedIndex = 0;

        Actions.clickInlineOption(clickedIndex);
        Expect.logUpdatedClassificationFromInlineOption(
          coveoDefaultField,
          clickedIndex
        );
      });
    });
  });

  describe('when maxChoices is greater than the number of options', () => {
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
          coveoDefaultField,
          allOptions.slice(0, suggestionsCount)
        );
        fetchClassifications();
        Expect.displaySelectTitle(false);
        Expect.numberOfSuggestions(suggestionsCount);
        Expect.numberOfInlineOptions(allOptions.length - suggestionsCount);
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
        Expect.displayLabel(true);
        Expect.numberOfInlineOptions(0);
        Expect.numberOfSuggestions(0);
        Expect.displaySelectTitle(false);
        Expect.displaySelectInput(true);
        Actions.reportValidity();
        Expect.displayError(true);
      });

      scope('when reporting validity and an option is selected', () => {
        const clickedIndex = 3;

        Actions.openSelectInput();
        Actions.clickSelectOption(clickedIndex);
        Expect.logUpdatedClassificationFromSelectOption(
          coveoDefaultField,
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
        const suggestionsCount = 2;

        mockCaseClassification(
          coveoDefaultField,
          allOptions.slice(0, suggestionsCount)
        );
        fetchClassifications();
        Expect.displaySelectTitle(true);
        Expect.displaySelectInput(false);
        Expect.numberOfSuggestions(suggestionsCount);
        Actions.reportValidity();
        Expect.displayError(true);
      });

      scope('when reporting validity and a suggestion is selected', () => {
        const clickedIndex = 0;

        Actions.clickSuggestion(clickedIndex);
        Expect.logClickedSuggestion(clickedIndex);
        Expect.logUpdatedClassificationFromSuggestion(
          coveoDefaultField,
          clickedIndex
        );

        Actions.reportValidity();
        Expect.displayError(false);
      });
    });
  });
});

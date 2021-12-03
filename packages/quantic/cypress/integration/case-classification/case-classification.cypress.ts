import {configure} from '../../page-objects/configurator';
import {
  InterceptAliases,
  interceptSearch,
  interceptSearchIndefinitely,
} from '../../page-objects/search';
import {CaseClassificationExpectations as Expect} from './case-classification-expectations';
import {CaseClassificationActions as Actions} from './case-classification-actions';
import {stubConsoleError} from '../console-selectors';
import {performSearch} from '../../page-objects/actions/action-perform-search';
import {scope} from '../../reporters/detailed-collector';

interface CaseClassificationOptions {
  numberOfSuggestions: number;
  label: string;
  required: boolean;
  slectPlaceholder: string;
  selectTitle: string;
  messageWhenValueMissing: string;
}

describe('quantic-pager', () => {
  const pageUrl = 's/quantic-case-classification';

  function visitCaseClassification(options: Partial<CaseClassificationOptions>) {
    cy.visit(pageUrl);
    configure(options);
  }

  describe('with default options', () => {
    it('should work as expected', () => {
      visitCaseClassification({});

      scope('when loading the page', () => {
        Expect.displayLabel(true);
        Expect.displaySelectTitle(true);
        Expect.numberOfSuggestions(3);
      });

      scope('when clicking select title', () => {
        Actions.clickSelectTitle();
        Expect.displaySelectInput(true);
      });

      scope('when clicking on an option from the suggested options', () => {
        Actions.clickSuggestion(0);
        Expect.numberOfSuggestions(3);
      });

      scope('when clicking on an option from the select input', () => {
        Actions.openSelectInput();
        Actions.clickSelectOption(1);
        Expect.hideSuggestions(true);
      });

    });
  });

  describe('with number of suggestions equals to zero', () => {
    it('should display the select input', () => {
      visitCaseClassification({
        numberOfSuggestions: 0,
      });

      Expect.displaySelectInput(true);
      Expect.numberOfSuggestions(0);
    });
  });

  describe('with number of suggestions lesser than zero', () => {
    it('should display the select input', () => {
      visitCaseClassification({
        numberOfSuggestions: -3,
      });

      Expect.displaySelectInput(true);
      Expect.numberOfSuggestions(0);
    });
  });
});

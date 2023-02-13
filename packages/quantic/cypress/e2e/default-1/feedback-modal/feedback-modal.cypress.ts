import {openModal} from '../../../page-objects/actions/action-open-modal';
import {configure} from '../../../page-objects/configurator';
import {scope} from '../../../reporters/detailed-collector';
import {stubConsoleError} from '../../console-selectors';
import {FeedbackModalActions as Actions} from './feedback-modal-actions';
import {FeedbackModalExpectations as Expect} from './feedback-modal-expectations';

const invalidArrayError = 'The options provided are not in a valid table.';
const EmptyArrayError = 'At least one option must be specified.';
const missingLabelOrValueError =
  'In the c-quantic-feedback-modal, each option requires a label and a value to be specified.';
const invalidLabelTypeError = (label: number) =>
  `The "${label}" label is not a valid string.`;
const invalidValueTypeError = (value: number) =>
  `The "${value}" value is not a valid string.`;

const exampleOptions = [
  {value: 'test1', label: 'test1'},
  {value: 'test2', label: 'test2'},
  {value: 'test3', label: 'test4'},
  {value: 'other', label: 'other'},
];

interface FeedbackModalOptions {
  options: string;
}

describe('quantic-feedback-modal', () => {
  const pageUrl = 's/quantic-feedback-modal';

  function visitPage(options: Partial<FeedbackModalOptions> = {}) {
    cy.visit(pageUrl, {
      onBeforeLoad(win) {
        stubConsoleError(win);
      },
    });
    configure(options);
  }

  describe('when using valid options', () => {
    it('should properly open and close the modal', () => {
      visitPage({
        options: JSON.stringify(exampleOptions),
      });

      scope('when loading the page', () => {
        Expect.displayModal(false);
      });

      scope('when opening the modal', () => {
        openModal();
        Expect.displayModal(true);
        Expect.displayOptions(exampleOptions);
      });

      scope('when clicking the cancel button', () => {
        Actions.clickCancel();
        Expect.displayModal(false);
      });
    });

    it('should properly validate the inputs of the feedback form', () => {
      scope(
        'when submitting the feedback form without selecting an option',
        () => {
          openModal();
          Actions.clickSubmit();
          Expect.displayErrorInOptionsInput(true);
        }
      );

      scope(
        'when submitting the feedback form without filling the details input',
        () => {
          Actions.clickSubmit();
          Expect.displayErrorInOptionsInput(true);
          Actions.clickOption(exampleOptions.length - 1);
          Actions.clickSubmit();
          Expect.displayErrorInOptionsInput(false);
          Expect.displayErrorInDetailsInput(true);
        }
      );
    });

    it('should properly display the success message after selecting a valid option', () => {
      scope(
        'when submitting the feedback form after selecting a valid option',
        () => {
          Actions.clickOption(0);
          Expect.displayDetailsInput(false);
          Actions.clickSubmit();
          Expect.displaySuccessMessage(true);
          Actions.clickDone();
          Expect.displayModal(false);
        }
      );
    });

    it('should properly display the success message after filling the details input', () => {
      scope(
        'when submitting the feedback form after filling the details input',
        () => {
          openModal();
          Actions.clickOption(exampleOptions.length - 1);
          Expect.displayDetailsInput(true);
          Actions.typeInDetailsInput('Test');
          Actions.clickSubmit();
          Expect.displaySuccessMessage(true);
          Actions.clickDone();
          Expect.displayModal(false);
        }
      );
    });
  });

  describe('when using invalid options', () => {
    it('should display an error when the options are not provided', () => {
      visitPage({
        options: '',
      });

      scope('when loading the page', () => {
        Expect.displayModal(false);
      });

      scope('when opening the modal', () => {
        openModal();
        Expect.console.errorMessage(invalidArrayError);
        Expect.displayErrorMessage(true);
      });

      scope('when closing the modal', () => {
        Actions.clickCancel();
        Expect.displayModal(false);
      });
    });

    it('should display an error when the options property is an empty array', () => {
      visitPage({
        options: '[]',
      });

      scope('when loading the page', () => {
        Expect.displayModal(false);
      });

      scope('when opening the modal', () => {
        openModal();
        Expect.console.errorMessage(EmptyArrayError);
        Expect.displayErrorMessage(true);
      });

      scope('when closing the modal', () => {
        Actions.clickCancel();
        Expect.displayModal(false);
      });
    });

    it('should display an error when an option without a label is specified', () => {
      visitPage({
        options: '[{"value": "test1"}]',
      });

      scope('when loading the page', () => {
        Expect.displayModal(false);
      });

      scope('when opening the modal', () => {
        openModal();
        Expect.console.errorMessage(missingLabelOrValueError);
        Expect.displayErrorMessage(true);
      });

      scope('when closing the modal', () => {
        Actions.clickCancel();
        Expect.displayModal(false);
      });
    });

    it('should display an error when an option without a value is specified', () => {
      visitPage({
        options: '[{"label": "test1"}]',
      });

      scope('when loading the page', () => {
        Expect.displayModal(false);
      });

      scope('when opening the modal', () => {
        openModal();
        Expect.console.errorMessage(missingLabelOrValueError);
        Expect.displayErrorMessage(true);
      });

      scope('when closing the modal', () => {
        Actions.clickCancel();
        Expect.displayModal(false);
      });
    });

    it('should display an error when a label of one of the options is not of type string', () => {
      const invalidLabel = 1;
      visitPage({
        options: `[{"value": "test1", "label": ${invalidLabel}}]`,
      });

      scope('when loading the page', () => {
        Expect.displayModal(false);
      });

      scope('when opening the modal', () => {
        openModal();
        Expect.console.errorMessage(invalidLabelTypeError(invalidLabel));
        Expect.displayErrorMessage(true);
      });

      scope('when closing the modal', () => {
        Actions.clickCancel();
        Expect.displayModal(false);
      });
    });

    it('should display an error when a value of one of the options is not of type string', () => {
      const invalidValue = 1;
      visitPage({
        options: `[{"label": "test1", "value": ${invalidValue}}]`,
      });

      scope('when loading the page', () => {
        Expect.displayModal(false);
      });

      scope('when opening the modal', () => {
        openModal();
        Expect.console.errorMessage(invalidValueTypeError(invalidValue));
        Expect.displayErrorMessage(true);
      });

      scope('when closing the modal', () => {
        Actions.clickCancel();
        Expect.displayModal(false);
      });
    });
  });
});

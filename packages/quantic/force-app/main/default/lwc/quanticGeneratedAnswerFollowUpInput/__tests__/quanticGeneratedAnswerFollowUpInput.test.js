import {buildCreateTestComponent, cleanup, flushPromises} from 'c/testUtils';
import QuanticGeneratedAnswerFollowUpInput from '../quanticGeneratedAnswerFollowUpInput';

jest.mock(
  '@salesforce/label/c.quantic_SubmitFollowUp',
  () => ({default: 'Submit follow-up'}),
  {virtual: true}
);
jest.mock(
  '@salesforce/label/c.quantic_AskFollowUp',
  () => ({default: 'Ask follow-up'}),
  {virtual: true}
);
jest.mock('c/quanticUtils', () => ({
  keys: {ENTER: 'Enter'},
}));

const selectors = {
  input: 'lightning-input',
  submitButton: 'lightning-button-icon',
  inputContainer: '.follow-up-input__input-container',
};

const createTestComponent = buildCreateTestComponent(
  QuanticGeneratedAnswerFollowUpInput,
  'c-quantic-generated-answer-follow-up-input'
);

describe('c-quantic-generated-answer-follow-up-input', () => {
  afterEach(() => {
    cleanup();
  });

  it('should render the input and submit button', async () => {
    const element = createTestComponent();
    await flushPromises();

    const input = element.shadowRoot.querySelector(selectors.input);
    const submitButton = element.shadowRoot.querySelector(
      selectors.submitButton
    );

    expect(input).not.toBeNull();
    expect(submitButton).not.toBeNull();
  });

  describe('submitting a follow up', () => {
    it('should dispatch quantic__submitfollowup when pressing Enter', async () => {
      const element = createTestComponent();
      await flushPromises();

      const handler = jest.fn();
      element.addEventListener('quantic__submitfollowup', handler);

      const input = element.shadowRoot.querySelector(selectors.input);
      input.value = 'follow up question';
      input.dispatchEvent(new KeyboardEvent('keydown', {key: 'Enter'}));

      expect(handler).toHaveBeenCalledTimes(1);
      expect(handler.mock.calls[0][0].detail.value).toBe(
        'follow up question'
      );
    });

    it('should dispatch quantic__submitfollowup when clicking the submit button', async () => {
      const element = createTestComponent();
      await flushPromises();

      const handler = jest.fn();
      element.addEventListener('quantic__submitfollowup', handler);

      const input = element.shadowRoot.querySelector(selectors.input);
      input.value = 'another question';

      const submitButton = element.shadowRoot.querySelector(
        selectors.submitButton
      );
      submitButton.click();

      expect(handler).toHaveBeenCalledTimes(1);
      expect(handler.mock.calls[0][0].detail.value).toBe('another question');
    });

    it('should clear the input and blur it after a successful submit', async () => {
      const element = createTestComponent();
      await flushPromises();

      const input = element.shadowRoot.querySelector(selectors.input);
      input.value = 'a question';
      input.blur = jest.fn();

      input.dispatchEvent(new KeyboardEvent('keydown', {key: 'Enter'}));

      expect(input.value).toBe('');
      expect(input.blur).toHaveBeenCalledTimes(1);
    });
  });

  describe('when submission should be blocked', () => {
    it('should not dispatch the event when submitButtonDisabled is true', async () => {
      const element = createTestComponent({submitButtonDisabled: true});
      await flushPromises();

      const handler = jest.fn();
      element.addEventListener('quantic__submitfollowup', handler);

      const input = element.shadowRoot.querySelector(selectors.input);
      input.value = 'a question';
      input.dispatchEvent(new KeyboardEvent('keydown', {key: 'Enter'}));

      expect(handler).not.toHaveBeenCalled();
    });

    it('should not dispatch the event when input is whitespace only', async () => {
      const element = createTestComponent();
      await flushPromises();

      const handler = jest.fn();
      element.addEventListener('quantic__submitfollowup', handler);

      const input = element.shadowRoot.querySelector(selectors.input);
      input.value = '   ';
      input.dispatchEvent(new KeyboardEvent('keydown', {key: 'Enter'}));

      expect(handler).not.toHaveBeenCalled();
    });

    it('should not dispatch the event when input is empty', async () => {
      const element = createTestComponent();
      await flushPromises();

      const handler = jest.fn();
      element.addEventListener('quantic__submitfollowup', handler);

      const input = element.shadowRoot.querySelector(selectors.input);
      input.value = '';

      const submitButton = element.shadowRoot.querySelector(
        selectors.submitButton
      );
      submitButton.click();

      expect(handler).not.toHaveBeenCalled();
    });
  });

  describe('focus and blur CSS class toggling', () => {
    it('should add the focused class when the input is focused', async () => {
      const element = createTestComponent();
      await flushPromises();

      const input = element.shadowRoot.querySelector(selectors.input);
      input.dispatchEvent(new CustomEvent('focus'));
      await flushPromises();

      const container = element.shadowRoot.querySelector(
        selectors.inputContainer
      );
      expect(container.classList).toContain(
        'follow-up-input__input-container--focused'
      );
    });

    it('should remove the focused class when the input is blurred', async () => {
      const element = createTestComponent();
      await flushPromises();

      const input = element.shadowRoot.querySelector(selectors.input);
      input.dispatchEvent(new CustomEvent('focus'));
      await flushPromises();

      input.dispatchEvent(new CustomEvent('blur'));
      await flushPromises();

      const container = element.shadowRoot.querySelector(
        selectors.inputContainer
      );
      expect(container.classList).not.toContain(
        'follow-up-input__input-container--focused'
      );
    });
  });
});

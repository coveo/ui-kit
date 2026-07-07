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
jest.mock(
  '@salesforce/label/c.quantic_FollowUpInputTooLong',
  () => ({
    default: 'Your question is too long. Please use {{0}} characters or fewer.',
  }),
  {virtual: true}
);
jest.mock('c/quanticUtils', () => ({
  keys: {ENTER: 'Enter', ESC: 'Escape'},
  I18nUtils: {
    format: (label, ...args) =>
      label.replace(/{{(\d+)}}/g, (_match, index) => args[index]),
  },
}));

const selectors = {
  textarea: 'textarea',
  submitButton: 'lightning-button-icon',
  container: '.follow-up-input__container',
  expander: '.follow-up-input__expander',
  counter: '.follow-up-input__counter',
  validationMessage: '[role="alert"]',
};

const expandedClass = 'follow-up-input__expander--expanded';
const errorClass = 'follow-up-input__container--error';
const MAX_LENGTH = 300;

const createTestComponent = buildCreateTestComponent(
  QuanticGeneratedAnswerFollowUpInput,
  'c-quantic-generated-answer-follow-up-input'
);

describe('c-quantic-generated-answer-follow-up-input', () => {
  afterEach(() => {
    cleanup();
  });

  it('should render the textarea and submit button', async () => {
    const element = createTestComponent();
    await flushPromises();

    expect(element.shadowRoot.querySelector(selectors.textarea)).not.toBeNull();
    expect(
      element.shadowRoot.querySelector(selectors.submitButton)
    ).not.toBeNull();
  });

  describe('submitting a follow up', () => {
    it('should dispatch #quantic__submitfollowup when pressing Enter', async () => {
      const element = createTestComponent();
      await flushPromises();

      const handler = jest.fn();
      element.addEventListener('quantic__submitfollowup', handler);

      const textarea = element.shadowRoot.querySelector(selectors.textarea);
      textarea.value = 'follow up question';
      textarea.dispatchEvent(new KeyboardEvent('keydown', {key: 'Enter'}));

      expect(handler).toHaveBeenCalledTimes(1);
      expect(handler.mock.calls[0][0].detail.value).toBe('follow up question');
    });

    it('should dispatch #quantic__submitfollowup when clicking the submit button', async () => {
      const element = createTestComponent();
      await flushPromises();

      const handler = jest.fn();
      element.addEventListener('quantic__submitfollowup', handler);

      const textarea = element.shadowRoot.querySelector(selectors.textarea);
      textarea.value = 'another question';

      element.shadowRoot.querySelector(selectors.submitButton).click();

      expect(handler).toHaveBeenCalledTimes(1);
      expect(handler.mock.calls[0][0].detail.value).toBe('another question');
    });

    it('should dispatch the trimmed value when the input has leading and trailing spaces', async () => {
      const element = createTestComponent();
      await flushPromises();

      const handler = jest.fn();
      element.addEventListener('quantic__submitfollowup', handler);

      const textarea = element.shadowRoot.querySelector(selectors.textarea);
      textarea.value = '  another question  ';
      element.shadowRoot.querySelector(selectors.submitButton).click();

      expect(handler).toHaveBeenCalledTimes(1);
      expect(handler.mock.calls[0][0].detail.value).toBe('another question');
    });

    it('should clear the textarea after a successful submit', async () => {
      const element = createTestComponent();
      await flushPromises();

      const textarea = element.shadowRoot.querySelector(selectors.textarea);
      textarea.value = 'a question';
      textarea.dispatchEvent(new KeyboardEvent('keydown', {key: 'Enter'}));

      expect(textarea.value).toBe('');
    });

    it('should collapse after a successful submit', async () => {
      const element = createTestComponent();
      await flushPromises();

      const textarea = element.shadowRoot.querySelector(selectors.textarea);
      textarea.dispatchEvent(new CustomEvent('focus'));
      await flushPromises();

      textarea.value = 'a question';
      textarea.dispatchEvent(new KeyboardEvent('keydown', {key: 'Enter'}));
      await flushPromises();

      const expander = element.shadowRoot.querySelector(selectors.expander);
      expect(expander.classList).not.toContain(expandedClass);
    });
  });

  describe('when submission should be blocked', () => {
    it('should not dispatch the event when submitButtonDisabled is true', async () => {
      const element = createTestComponent({submitButtonDisabled: true});
      await flushPromises();

      const handler = jest.fn();
      element.addEventListener('quantic__submitfollowup', handler);

      const textarea = element.shadowRoot.querySelector(selectors.textarea);
      textarea.value = 'a question';
      textarea.dispatchEvent(new KeyboardEvent('keydown', {key: 'Enter'}));

      expect(handler).not.toHaveBeenCalled();
    });

    it('should not dispatch the event when input is whitespace only', async () => {
      const element = createTestComponent();
      await flushPromises();

      const handler = jest.fn();
      element.addEventListener('quantic__submitfollowup', handler);

      const textarea = element.shadowRoot.querySelector(selectors.textarea);
      textarea.value = '   ';
      textarea.dispatchEvent(new KeyboardEvent('keydown', {key: 'Enter'}));

      expect(handler).not.toHaveBeenCalled();
    });

    it('should not dispatch the event when input is empty', async () => {
      const element = createTestComponent();
      await flushPromises();

      const handler = jest.fn();
      element.addEventListener('quantic__submitfollowup', handler);

      const textarea = element.shadowRoot.querySelector(selectors.textarea);
      textarea.value = '';
      element.shadowRoot.querySelector(selectors.submitButton).click();

      expect(handler).not.toHaveBeenCalled();
    });
  });

  describe('expandable input behaviour', () => {
    it('should expand and add focused class on focus', async () => {
      const element = createTestComponent();
      await flushPromises();

      const textarea = element.shadowRoot.querySelector(selectors.textarea);
      textarea.dispatchEvent(new CustomEvent('focus'));
      await flushPromises();

      const expander = element.shadowRoot.querySelector(selectors.expander);
      const container = element.shadowRoot.querySelector(selectors.container);
      expect(expander.classList).toContain(expandedClass);
      expect(container.classList).toContain(
        'follow-up-input__container--focused'
      );
    });

    it('should collapse and remove focused class on blur', async () => {
      const element = createTestComponent();
      await flushPromises();

      const textarea = element.shadowRoot.querySelector(selectors.textarea);
      textarea.dispatchEvent(new CustomEvent('focus'));
      await flushPromises();

      textarea.dispatchEvent(new CustomEvent('blur'));
      await flushPromises();

      const expander = element.shadowRoot.querySelector(selectors.expander);
      const container = element.shadowRoot.querySelector(selectors.container);
      expect(expander.classList).not.toContain(expandedClass);
      expect(container.classList).not.toContain(
        'follow-up-input__container--focused'
      );
    });

    it('should sync replica text on input', async () => {
      const element = createTestComponent();
      await flushPromises();

      const textarea = element.shadowRoot.querySelector(selectors.textarea);
      const expander = element.shadowRoot.querySelector(selectors.expander);

      textarea.value = 'multi\nline\ntext';
      textarea.dispatchEvent(new CustomEvent('input'));
      await flushPromises();

      expect(expander.dataset.replicatedValue).toBe('multi\nline\ntext');
    });

    it('should clear replica text after submit', async () => {
      const element = createTestComponent();
      await flushPromises();

      const textarea = element.shadowRoot.querySelector(selectors.textarea);
      const expander = element.shadowRoot.querySelector(selectors.expander);

      textarea.value = 'some text';
      textarea.dispatchEvent(new CustomEvent('input'));
      await flushPromises();
      expect(expander.dataset.replicatedValue).toBe('some text');

      textarea.dispatchEvent(new KeyboardEvent('keydown', {key: 'Enter'}));
      await flushPromises();

      expect(expander.dataset.replicatedValue).toBeUndefined();
    });

    it('should collapse the textarea when the Escape key is pressed', async () => {
      const element = createTestComponent();
      await flushPromises();

      const textarea = element.shadowRoot.querySelector(selectors.textarea);
      textarea.blur = jest.fn();
      textarea.dispatchEvent(new CustomEvent('focus'));
      await flushPromises();

      textarea.dispatchEvent(new KeyboardEvent('keydown', {key: 'Escape'}));
      await flushPromises();

      expect(textarea.blur).toHaveBeenCalled();
    });
  });

  describe('character limit validation', () => {
    it('should display the character counter starting at 0 / 300', async () => {
      const element = createTestComponent();
      await flushPromises();

      const counter = element.shadowRoot.querySelector(selectors.counter);
      expect(counter.textContent.trim()).toBe('0 / 300');
    });

    it('should update the character counter as the user types', async () => {
      const element = createTestComponent();
      await flushPromises();

      const textarea = element.shadowRoot.querySelector(selectors.textarea);
      textarea.value = 'hello';
      textarea.dispatchEvent(new CustomEvent('input'));
      await flushPromises();

      const counter = element.shadowRoot.querySelector(selectors.counter);
      expect(counter.textContent.trim()).toBe('5 / 300');
    });

    it('should not count leading and trailing spaces in the character counter', async () => {
      const element = createTestComponent();
      await flushPromises();

      const textarea = element.shadowRoot.querySelector(selectors.textarea);
      textarea.value = '   hello   ';
      textarea.dispatchEvent(new CustomEvent('input'));
      await flushPromises();

      const counter = element.shadowRoot.querySelector(selectors.counter);
      expect(counter.textContent.trim()).toBe('5 / 300');
    });

    it('should not flag the input as over the limit when trailing spaces push the raw length past the limit', async () => {
      const element = createTestComponent();
      await flushPromises();

      const textarea = element.shadowRoot.querySelector(selectors.textarea);
      textarea.value = `${'a'.repeat(MAX_LENGTH)}     `;
      textarea.dispatchEvent(new CustomEvent('input'));
      await flushPromises();

      const counter = element.shadowRoot.querySelector(selectors.counter);
      expect(counter.textContent.trim()).toBe('300 / 300');

      const container = element.shadowRoot.querySelector(selectors.container);
      expect(container.classList).not.toContain(errorClass);

      const message = element.shadowRoot.querySelector(
        selectors.validationMessage
      );
      expect(message).toBeNull();
    });

    it('should show the exceeded count when over the limit', async () => {
      const element = createTestComponent();
      await flushPromises();

      const textarea = element.shadowRoot.querySelector(selectors.textarea);
      textarea.value = 'a'.repeat(MAX_LENGTH + 26);
      textarea.dispatchEvent(new CustomEvent('input'));
      await flushPromises();

      const counter = element.shadowRoot.querySelector(selectors.counter);
      expect(counter.textContent.trim()).toBe('326 / 300');
    });

    it('should put the input container in an error state and display a validation message when over the limit', async () => {
      const element = createTestComponent();
      await flushPromises();

      const textarea = element.shadowRoot.querySelector(selectors.textarea);
      textarea.value = 'a'.repeat(MAX_LENGTH + 1);
      textarea.dispatchEvent(new CustomEvent('input'));
      await flushPromises();

      const container = element.shadowRoot.querySelector(selectors.container);
      expect(container.classList).toContain(errorClass);
      const message = element.shadowRoot.querySelector(
        selectors.validationMessage
      );
      expect(message).not.toBeNull();
      expect(message.textContent.trim()).toBe(
        'Your question is too long. Please use 300 characters or fewer.'
      );
    });

    it('should not display a validation message when within the limit', async () => {
      const element = createTestComponent();
      await flushPromises();

      const textarea = element.shadowRoot.querySelector(selectors.textarea);
      textarea.value = 'a'.repeat(MAX_LENGTH);
      textarea.dispatchEvent(new CustomEvent('input'));
      await flushPromises();

      const message = element.shadowRoot.querySelector(
        selectors.validationMessage
      );
      expect(message).toBeNull();
    });

    it('should associate the textarea with the validation message via aria-describedby when over the limit', async () => {
      const element = createTestComponent();
      await flushPromises();

      const textarea = element.shadowRoot.querySelector(selectors.textarea);
      expect(textarea.getAttribute('aria-describedby')).toBeNull();

      textarea.value = 'a'.repeat(MAX_LENGTH + 1);
      textarea.dispatchEvent(new CustomEvent('input'));
      await flushPromises();

      const message = element.shadowRoot.querySelector(
        selectors.validationMessage
      );
      expect(message.id).toBeTruthy();
      expect(textarea.getAttribute('aria-describedby')).toBe(message.id);
    });

    it('should remove aria-describedby once the value is back within the limit', async () => {
      const element = createTestComponent();
      await flushPromises();

      const textarea = element.shadowRoot.querySelector(selectors.textarea);
      textarea.value = 'a'.repeat(MAX_LENGTH + 1);
      textarea.dispatchEvent(new CustomEvent('input'));
      await flushPromises();

      expect(textarea.getAttribute('aria-describedby')).not.toBeNull();

      textarea.value = 'a'.repeat(MAX_LENGTH);
      textarea.dispatchEvent(new CustomEvent('input'));
      await flushPromises();

      expect(textarea.getAttribute('aria-describedby')).toBeNull();
    });

    it('should disable the submit button when over the limit', async () => {
      const element = createTestComponent();
      await flushPromises();

      const textarea = element.shadowRoot.querySelector(selectors.textarea);
      textarea.value = 'a'.repeat(MAX_LENGTH + 1);
      textarea.dispatchEvent(new CustomEvent('input'));
      await flushPromises();

      const submitButton = element.shadowRoot.querySelector(
        selectors.submitButton
      );
      expect(submitButton.disabled).toBe(true);
    });

    it('should not dispatch the event when over the limit', async () => {
      const element = createTestComponent();
      await flushPromises();

      const handler = jest.fn();
      element.addEventListener('quantic__submitfollowup', handler);

      const textarea = element.shadowRoot.querySelector(selectors.textarea);
      textarea.value = 'a'.repeat(MAX_LENGTH + 1);
      textarea.dispatchEvent(new CustomEvent('input'));
      await flushPromises();

      textarea.dispatchEvent(new KeyboardEvent('keydown', {key: 'Enter'}));

      expect(handler).not.toHaveBeenCalled();
    });

    it('should clear the error state once the value is back within the limit', async () => {
      const element = createTestComponent();
      await flushPromises();

      const textarea = element.shadowRoot.querySelector(selectors.textarea);
      textarea.value = 'a'.repeat(MAX_LENGTH + 1);
      textarea.dispatchEvent(new CustomEvent('input'));
      await flushPromises();

      let container = element.shadowRoot.querySelector(selectors.container);
      expect(container.classList).toContain(errorClass);

      textarea.value = 'a'.repeat(MAX_LENGTH);
      textarea.dispatchEvent(new CustomEvent('input'));
      await flushPromises();

      container = element.shadowRoot.querySelector(selectors.container);
      expect(container.classList).not.toContain(errorClass);
    });

    it('should reset the character counter after a successful submit', async () => {
      const element = createTestComponent();
      await flushPromises();

      const textarea = element.shadowRoot.querySelector(selectors.textarea);
      textarea.value = 'a question';
      textarea.dispatchEvent(new CustomEvent('input'));
      await flushPromises();

      textarea.dispatchEvent(new KeyboardEvent('keydown', {key: 'Enter'}));
      await flushPromises();

      const counter = element.shadowRoot.querySelector(selectors.counter);
      expect(counter.textContent.trim()).toBe('0 / 300');
    });
  });
});

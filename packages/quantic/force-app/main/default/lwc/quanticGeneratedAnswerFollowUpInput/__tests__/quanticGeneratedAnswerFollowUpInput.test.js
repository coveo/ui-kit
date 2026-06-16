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
  textarea: 'textarea',
  submitButton: 'lightning-button-icon',
  container: '.follow-up-input__container',
  expander: '.follow-up-input__expander',
};

const expandedClass = 'follow-up-input__expander--expanded';

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
  });
});

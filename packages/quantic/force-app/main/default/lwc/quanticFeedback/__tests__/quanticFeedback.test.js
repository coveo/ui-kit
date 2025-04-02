/* eslint-disable jest/no-focused-tests */
// @ts-ignore
import {createElement} from 'lwc';
import QuanticFeedback from '../quanticFeedback';

const functionsMocks = {
  exampleHandleLike: jest.fn(),
  exampleHandleDislike: jest.fn(),
  exampleHandleExplainWhy: jest.fn(),
};

const exampleQuestion = 'Example question';
const exampleSuccessMessage = 'Example success Message';
const defaultLikeIconName = 'utility:success';
const defaultLikeLabel = 'yes';
const defaultDislikeIconName = 'utility:clear';
const defaultDislikeLabel = 'no';
const defaultSize = 'xx-small';

jest.mock(
  '@salesforce/label/c.quantic_Yes',
  () => ({default: defaultLikeLabel}),
  {
    virtual: true,
  }
);
jest.mock(
  '@salesforce/label/c.quantic_No',
  () => ({default: defaultDislikeLabel}),
  {
    virtual: true,
  }
);

const selectors = {
  feedbackQuestion: '.feedback__question',
  likeButton: 'c-quantic-stateful-button[data-testid="feedback__like-button"]',
  dislikeButton:
    'c-quantic-stateful-button[data-testid="feedback__dislike-button"]',
  successMessage: '.feedback__success-message',
  explainWhyButton: '.feedback__explain-why',
};

const defaultOptions = {
  state: 'neutral',
  question: exampleQuestion,
  hideExplainWhyButton: false,
  successMessage: exampleSuccessMessage,
  likeLabel: defaultLikeLabel,
  dislikeLabel: defaultDislikeLabel,
};

function setupEventListeners(element) {
  element.addEventListener('quantic__like', functionsMocks.exampleHandleLike);
  element.addEventListener(
    'quantic__dislike',
    functionsMocks.exampleHandleDislike
  );
  element.addEventListener(
    'quantic__pressexplainwhy',
    functionsMocks.exampleHandleExplainWhy
  );
}

function createTestComponent(options = defaultOptions) {
  const element = createElement('c-quantic-feedback', {
    is: QuanticFeedback,
  });

  for (const [key, value] of Object.entries(options)) {
    element[key] = value;
  }

  document.body.appendChild(element);
  return element;
}

// Helper function to wait until the microtask queue is empty.
function flushPromises() {
  // eslint-disable-next-line @lwc/lwc/no-async-operation
  return new Promise((resolve) => setTimeout(resolve, 0));
}

describe('c-quantic-feedback', () => {
  function cleanup() {
    // The jsdom instance is shared across test cases in a single file so reset the DOM
    while (document.body.firstChild) {
      document.body.removeChild(document.body.firstChild);
    }
    jest.clearAllMocks();
  }

  afterEach(() => {
    cleanup();
  });

  it('should properly display the feedback question', async () => {
    const element = createTestComponent();
    await flushPromises();

    const question = element.shadowRoot.querySelector(
      selectors.feedbackQuestion
    );

    expect(question).not.toBeNull();
    expect(question.textContent).toBe(exampleQuestion);
  });

  describe('when the component is in a neutral state', () => {
    it('should display the feedback buttons in a neutral state', async () => {
      const element = createTestComponent();
      await flushPromises();

      const likeButton = element.shadowRoot.querySelector(selectors.likeButton);
      const dislikeButton = element.shadowRoot.querySelector(
        selectors.dislikeButton
      );

      expect(likeButton.iconName).toBe(defaultLikeIconName);
      expect(likeButton.selected).toBe(false);
      expect(likeButton.label).toBe(defaultLikeLabel);
      expect(likeButton.tooltip).toBe(defaultLikeLabel);
      expect(likeButton.iconSize).toBe(defaultSize);
      expect(likeButton.withoutBorders).toBe(true);

      expect(dislikeButton.iconName).toBe(defaultDislikeIconName);
      expect(dislikeButton.selected).toBe(false);
      expect(dislikeButton.label).toBe(defaultDislikeLabel);
      expect(dislikeButton.tooltip).toBe(defaultDislikeLabel);
      expect(dislikeButton.iconSize).toBe(defaultSize);
      expect(dislikeButton.withoutBorders).toBe(true);
    });

    it('should not display the success message', async () => {
      const element = createTestComponent();
      await flushPromises();

      const successMessage = element.shadowRoot.querySelector(
        selectors.successMessage
      );

      expect(successMessage).toBeNull();
    });

    describe('when the like button is clicked', () => {
      it('should dispatch the quantic__like" event', async () => {
        const element = createTestComponent();
        setupEventListeners(element);
        await flushPromises();

        const likeButton = element.shadowRoot.querySelector(
          selectors.likeButton
        );
        likeButton.dispatchEvent(new CustomEvent('quantic__select'));

        expect(likeButton).not.toBeNull();
        expect(functionsMocks.exampleHandleLike).toHaveBeenCalledTimes(1);
      });
    });

    describe('when the dislike button is clicked', () => {
      it('should dispatch the "quantic__dislike" event', async () => {
        const element = createTestComponent();
        setupEventListeners(element);
        await flushPromises();

        const dislikeButton = element.shadowRoot.querySelector(
          selectors.dislikeButton
        );
        dislikeButton.dispatchEvent(new CustomEvent('quantic__select'));

        expect(dislikeButton).not.toBeNull();
        expect(functionsMocks.exampleHandleDislike).toHaveBeenCalledTimes(1);
      });
    });

    describe('when custom properties are passed', () => {
      const customLikeIconName = 'utility:like';
      const customLikeLabel = 'like';
      const customDislikeIconName = 'utility:dislike';
      const customDislikeLabel = 'dislike';
      const customSize = 'large';

      it('should display the feedback buttons properly', async () => {
        const element = createTestComponent({
          ...defaultOptions,
          likeIconName: customLikeIconName,
          likeLabel: customLikeLabel,
          dislikeIconName: customDislikeIconName,
          dislikeLabel: customDislikeLabel,
          size: customSize,
        });
        await flushPromises();

        const likeButton = element.shadowRoot.querySelector(
          selectors.likeButton
        );
        const dislikeButton = element.shadowRoot.querySelector(
          selectors.dislikeButton
        );

        expect(likeButton.iconName).toBe(customLikeIconName);
        expect(likeButton.selected).toBe(false);
        expect(likeButton.label).toBe(customLikeLabel);
        expect(likeButton.tooltip).toBe(customLikeLabel);
        expect(likeButton.iconSize).toBe(customSize);
        expect(likeButton.withoutBorders).toBe(true);

        expect(dislikeButton.iconName).toBe(customDislikeIconName);
        expect(dislikeButton.selected).toBe(false);
        expect(dislikeButton.label).toBe(customDislikeLabel);
        expect(dislikeButton.tooltip).toBe(customDislikeLabel);
        expect(dislikeButton.iconSize).toBe(customSize);
        expect(dislikeButton.withoutBorders).toBe(true);
      });
    });

    describe('when the property hideLabels is set to true', () => {
      it('should display the feedback buttons properly', async () => {
        const element = createTestComponent({
          ...defaultOptions,
          hideLabels: true,
        });
        await flushPromises();

        const likeButton = element.shadowRoot.querySelector(
          selectors.likeButton
        );
        const dislikeButton = element.shadowRoot.querySelector(
          selectors.dislikeButton
        );

        expect(likeButton.label).toBe('');
        expect(likeButton.tooltip).toBe(defaultLikeLabel);
        expect(dislikeButton.label).toBe('');
        expect(dislikeButton.tooltip).toBe(defaultDislikeLabel);
      });
    });
  });

  describe('when the component is in a liked state', () => {
    it('should display the feedback buttons in a liked state', async () => {
      const element = createTestComponent({...defaultOptions, state: 'liked'});
      await flushPromises();

      const likeButton = element.shadowRoot.querySelector(selectors.likeButton);
      const dislikeButton = element.shadowRoot.querySelector(
        selectors.dislikeButton
      );

      expect(likeButton.selected).toBe(true);
      expect(likeButton.selectedStateColor).toBe('#2e844a');
      expect(dislikeButton.selected).toBe(false);
    });

    it('should display the success message', async () => {
      const element = createTestComponent({...defaultOptions, state: 'liked'});
      await flushPromises();

      const successMessage = element.shadowRoot.querySelector(
        selectors.successMessage
      );
      const explainWhyButton = element.shadowRoot.querySelector(
        selectors.explainWhyButton
      );

      expect(successMessage).not.toBeNull();
      expect(successMessage.textContent).toBe(exampleSuccessMessage);
      expect(explainWhyButton).not.toBeNull();
    });

    describe('when the explain why button is clicked', () => {
      it('should dispatch the "quantic__pressexplainwhy" event', async () => {
        const element = createTestComponent({
          ...defaultOptions,
          state: 'liked',
        });
        setupEventListeners(element);
        await flushPromises();

        const explainWhyButton = element.shadowRoot.querySelector(
          selectors.explainWhyButton
        );
        explainWhyButton.click();

        expect(explainWhyButton).not.toBeNull();
        expect(functionsMocks.exampleHandleExplainWhy).toHaveBeenCalledTimes(1);
      });
    });

    describe('when the hideExplainWhy property is set to true', () => {
      it('should display the success message without the explain why button', async () => {
        const element = createTestComponent({
          ...defaultOptions,
          state: 'liked',
          hideExplainWhyButton: true,
        });
        await flushPromises();

        const successMessage = element.shadowRoot.querySelector(
          selectors.successMessage
        );
        const explainWhyButton = element.shadowRoot.querySelector(
          selectors.explainWhyButton
        );

        expect(successMessage).not.toBeNull();
        expect(successMessage.textContent).toBe(exampleSuccessMessage);
        expect(explainWhyButton).toBeNull();
      });
    });
  });

  describe('when the component is in a disliked state', () => {
    it('should display the feedback buttons in a disliked state', async () => {
      const element = createTestComponent({
        ...defaultOptions,
        state: 'disliked',
      });
      await flushPromises();

      const likeButton = element.shadowRoot.querySelector(selectors.likeButton);
      const dislikeButton = element.shadowRoot.querySelector(
        selectors.dislikeButton
      );

      expect(likeButton.selected).toBe(false);
      expect(dislikeButton.selected).toBe(true);
      expect(dislikeButton.selectedStateColor).toBe('#ea001e');
    });

    it('should display the success message', async () => {
      const element = createTestComponent({
        ...defaultOptions,
        state: 'disliked',
      });
      await flushPromises();

      const successMessage = element.shadowRoot.querySelector(
        selectors.successMessage
      );
      const explainWhyButton = element.shadowRoot.querySelector(
        selectors.explainWhyButton
      );

      expect(successMessage).not.toBeNull();
      expect(successMessage.textContent).toBe(exampleSuccessMessage);
      expect(explainWhyButton).not.toBeNull();
    });

    describe('when the explain why button is clicked', () => {
      it('should dispatch the "quantic__pressexplainwhy" event', async () => {
        const element = createTestComponent({
          ...defaultOptions,
          state: 'disliked',
        });
        setupEventListeners(element);
        await flushPromises();

        const explainWhyButton = element.shadowRoot.querySelector(
          selectors.explainWhyButton
        );
        explainWhyButton.click();

        expect(explainWhyButton).not.toBeNull();
        expect(functionsMocks.exampleHandleExplainWhy).toHaveBeenCalledTimes(1);
      });
    });

    describe('when the hideExplainWhy property is set to true', () => {
      it('should display the success message without the explain why button', async () => {
        const element = createTestComponent({
          ...defaultOptions,
          state: 'disliked',
          hideExplainWhyButton: true,
        });
        await flushPromises();

        const successMessage = element.shadowRoot.querySelector(
          selectors.successMessage
        );
        const explainWhyButton = element.shadowRoot.querySelector(
          selectors.explainWhyButton
        );

        expect(successMessage).not.toBeNull();
        expect(successMessage.textContent).toBe(exampleSuccessMessage);
        expect(explainWhyButton).toBeNull();
      });
    });
  });
});

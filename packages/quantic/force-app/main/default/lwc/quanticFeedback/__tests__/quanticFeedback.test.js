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

const selectors = {
  feedbackQuestion: '.feedback__question',
  likeButton: '.slds-button:nth-of-type(1)',
  likeButtonIcon: '.slds-button:nth-of-type(1) > lightning-icon ',
  dislikeButton: '.slds-button:nth-of-type(2) ',
  dislikeButtonIcon: '.slds-button:nth-of-type(2) > lightning-icon ',
  successMessage: '.feedback__success-message',
  explainWhyButton: '.feedback__explain-why',
};

const defaultOptions = {
  state: 'neutral',
  question: exampleQuestion,
  hideExplainWhyButton: false,
  successMessage: exampleSuccessMessage,
};

function setupEventListeners(element) {
  element.addEventListener('like', functionsMocks.exampleHandleLike);
  element.addEventListener('dislike', functionsMocks.exampleHandleDislike);
  element.addEventListener(
    'pressexplainwhy',
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
      const likeButtonIcon = element.shadowRoot.querySelector(
        selectors.likeButtonIcon
      );
      const dislikeButton = element.shadowRoot.querySelector(
        selectors.dislikeButton
      );
      const dislikeButtonIcon = element.shadowRoot.querySelector(
        selectors.dislikeButtonIcon
      );

      expect(likeButtonIcon.variant).toBeNull();
      expect(dislikeButtonIcon.variant).toBeNull();
      expect(likeButton.classList.contains('feedback__button--neutral')).toBe(
        true
      );
      expect(
        dislikeButton.classList.contains('feedback__button--neutral')
      ).toBe(true);
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
      it('should dispatch the "like" event', async () => {
        const element = createTestComponent();
        setupEventListeners(element);
        await flushPromises();

        const likeButton = element.shadowRoot.querySelector(
          selectors.likeButton
        );
        likeButton.click();

        expect(likeButton).not.toBeNull();
        expect(functionsMocks.exampleHandleLike).toHaveBeenCalledTimes(1);
      });
    });

    describe('when the dislike button is clicked', () => {
      it('should dispatch the "dislike" event', async () => {
        const element = createTestComponent();
        setupEventListeners(element);
        await flushPromises();

        const dislikeButton = element.shadowRoot.querySelector(
          selectors.dislikeButton
        );
        dislikeButton.click();

        expect(dislikeButton).not.toBeNull();
        expect(functionsMocks.exampleHandleDislike).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe('when the component is in a liked state', () => {
    it('should display the feedback buttons in a liked state', async () => {
      const element = createTestComponent({...defaultOptions, state: 'liked'});
      await flushPromises();

      const likeButton = element.shadowRoot.querySelector(selectors.likeButton);
      const likeButtonIcon = element.shadowRoot.querySelector(
        selectors.likeButtonIcon
      );
      const dislikeButton = element.shadowRoot.querySelector(
        selectors.dislikeButton
      );
      const dislikeButtonIcon = element.shadowRoot.querySelector(
        selectors.dislikeButtonIcon
      );

      expect(likeButtonIcon.variant).toBe('success');
      expect(dislikeButtonIcon.variant).toBeNull();
      expect(likeButton.classList.contains('feedback__button--liked')).toBe(
        true
      );
      expect(
        dislikeButton.classList.contains('feedback__button--neutral')
      ).toBe(true);
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
      it('should dispatch the "pressexplainwhy" event', async () => {
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
      const likeButtonIcon = element.shadowRoot.querySelector(
        selectors.likeButtonIcon
      );
      const dislikeButton = element.shadowRoot.querySelector(
        selectors.dislikeButton
      );
      const dislikeButtonIcon = element.shadowRoot.querySelector(
        selectors.dislikeButtonIcon
      );
      expect(likeButtonIcon.variant).toBeNull();
      expect(dislikeButtonIcon.variant).toBe('error');
      expect(likeButton.classList.contains('feedback__button--neutral')).toBe(
        true
      );
      expect(
        dislikeButton.classList.contains('feedback__button--disliked')
      ).toBe(true);
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
      it('should dispatch the "pressexplainwhy" event', async () => {
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

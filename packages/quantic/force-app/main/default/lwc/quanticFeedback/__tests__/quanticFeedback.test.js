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
const specifiedLikeLabel = 'This answer was helpful';
const specifiedDislikeLabel = 'This answer was not helpful';

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
  likeButton: '.feedback__like-button',
  likeButtonIcon: '.feedback__like-button > lightning-icon',
  likeButtonLabel: '.feedback__like-button > .feedback__button-label',
  dislikeButton: '.feedback__dislike-button',
  dislikeButtonIcon: '.feedback__dislike-button > lightning-icon',
  dislikeButtonLabel: '.feedback__dislike-button > .feedback__button-label',
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
      const likeButtonLabel = element.shadowRoot.querySelector(
        selectors.likeButtonLabel
      );
      const dislikeButton = element.shadowRoot.querySelector(
        selectors.dislikeButton
      );
      const dislikeButtonIcon = element.shadowRoot.querySelector(
        selectors.dislikeButtonIcon
      );
      const dislikeButtonLabel = element.shadowRoot.querySelector(
        selectors.dislikeButtonLabel
      );

      expect(likeButtonIcon.variant).toBeNull();
      expect(likeButtonIcon.size).toBe(defaultSize);
      expect(likeButtonIcon.iconName).toBe(defaultLikeIconName);
      expect(likeButtonLabel.textContent).toBe(defaultLikeLabel);
      expect(likeButton.ariaLabel).toBe(defaultLikeLabel);
      expect(dislikeButtonIcon.variant).toBeNull();
      expect(dislikeButtonIcon.size).toBe(defaultSize);
      expect(dislikeButtonIcon.iconName).toBe(defaultDislikeIconName);
      expect(dislikeButtonLabel.textContent).toBe(defaultDislikeLabel);
      expect(dislikeButton.ariaLabel).toBe(defaultDislikeLabel);

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

    it('should have a title attribute with the default label on the like button', async () => {
      const element = createTestComponent();
      await flushPromises();

      const button = element.shadowRoot.querySelector(selectors.likeButton);

      expect(button.title).toEqual(defaultLikeLabel);
    });

    it('should have a title attribute with the default label on the dislike button', async () => {
      const element = createTestComponent();
      await flushPromises();

      const button = element.shadowRoot.querySelector(selectors.dislikeButton);

      expect(button.title).toEqual(defaultDislikeLabel);
    });

    describe('When labels are specified as properties to the quanticFeedback component', () => {
      it('should have a title attribute with the specified title on the like button', async () => {
        const element = createTestComponent({
          ...defaultOptions,
          likeLabel: specifiedLikeLabel,
        });
        await flushPromises();

        const button = element.shadowRoot.querySelector(selectors.likeButton);

        expect(button.title).toEqual(specifiedLikeLabel);
      });

      it('should have a title attribute with the specified title on the dislike button', async () => {
        const element = createTestComponent({
          ...defaultOptions,
          likeLabel: specifiedDislikeLabel,
        });
        await flushPromises();

        const button = element.shadowRoot.querySelector(selectors.likeButton);

        expect(button.title).toEqual(specifiedDislikeLabel);
      });
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
        const likeButtonIcon = element.shadowRoot.querySelector(
          selectors.likeButtonIcon
        );
        const likeButtonLabel = element.shadowRoot.querySelector(
          selectors.likeButtonLabel
        );
        const dislikeButtonIcon = element.shadowRoot.querySelector(
          selectors.dislikeButtonIcon
        );
        const dislikeButtonLabel = element.shadowRoot.querySelector(
          selectors.dislikeButtonLabel
        );

        expect(likeButtonIcon.variant).toBeNull();
        expect(likeButtonIcon.size).toBe(customSize);
        expect(likeButtonIcon.iconName).toBe(customLikeIconName);
        expect(likeButtonLabel.textContent).toBe(customLikeLabel);
        expect(likeButton.ariaLabel).toBe(customLikeLabel);
        expect(dislikeButtonIcon.variant).toBeNull();
        expect(dislikeButtonIcon.size).toBe(customSize);
        expect(dislikeButtonIcon.iconName).toBe(customDislikeIconName);
        expect(dislikeButtonLabel.textContent).toBe(customDislikeLabel);
        expect(dislikeButton.ariaLabel).toBe(customDislikeLabel);
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
        const likeButtonLabel = element.shadowRoot.querySelector(
          selectors.likeButtonLabel
        );
        const dislikeButtonLabel = element.shadowRoot.querySelector(
          selectors.dislikeButtonLabel
        );

        expect(likeButtonLabel).toBeNull();
        expect(likeButton.ariaLabel).toBe(defaultLikeLabel);
        expect(dislikeButtonLabel).toBeNull();
        expect(dislikeButton.ariaLabel).toBe(defaultDislikeLabel);
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

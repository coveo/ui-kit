// @ts-ignore
import QuanticGeneratedAnswerThread from '../quanticGeneratedAnswerThread';
import {buildCreateTestComponent, cleanup, flushPromises} from 'c/testUtils';

jest.mock('c/quanticUtils', () => ({
  I18nUtils: {
    format: jest.fn((label, count) => `Show ${count} previous questions`),
  },
}));

jest.mock(
  '@salesforce/label/c.quantic_ShowPreviousQuestions_plural',
  () => ({default: 'Show {{0}} previous questions'}),
  {virtual: true}
);

const selectors = {
  generatedAnswerBody: 'c-quantic-generated-answer-body',
  threadItem: 'c-quantic-thread-item',
  showPreviousButton: '[data-testid="show-previous-button"]',
  showPreviousDot: '[data-testid="show-previous-dot"]',
};

function buildGeneratedAnswer(overrides = {}) {
  return {
    answerId: `answer-${Math.random()}`,
    question: 'What is Coveo?',
    answer: 'Coveo is a search platform.',
    citations: [],
    isStreaming: false,
    liked: false,
    disliked: false,
    ...overrides,
  };
}

const createTestComponent = buildCreateTestComponent(
  QuanticGeneratedAnswerThread,
  'c-quantic-generated-answer-thread',
  {
    engineId: 'test-engine',
    generatedAnswers: [],
  }
);

describe('c-quantic-generated-answer-thread', () => {
  afterEach(() => {
    cleanup();
  });

  describe('with a single answer', () => {
    it('renders a single generated answer body without thread items', async () => {
      const answers = [buildGeneratedAnswer()];
      const element = createTestComponent({generatedAnswers: answers});
      await flushPromises();

      const body = element.shadowRoot.querySelectorAll(
        selectors.generatedAnswerBody
      );
      expect(body).toHaveLength(1);

      const threadItems = element.shadowRoot.querySelectorAll(
        selectors.threadItem
      );
      expect(threadItems).toHaveLength(0);
    });

    it('does not render the show previous button', async () => {
      const answers = [buildGeneratedAnswer()];
      const element = createTestComponent({generatedAnswers: answers});
      await flushPromises();

      const button = element.shadowRoot.querySelector(
        selectors.showPreviousButton
      );
      expect(button).toBeNull();
    });
  });

  describe('with two answers', () => {
    it('renders both answers in thread items', async () => {
      const answers = [
        buildGeneratedAnswer({answerId: 'a1', question: 'Q1'}),
        buildGeneratedAnswer({answerId: 'a2', question: 'Q2'}),
      ];
      const element = createTestComponent({generatedAnswers: answers});
      await flushPromises();

      const threadItems = element.shadowRoot.querySelectorAll(
        selectors.threadItem
      );
      expect(threadItems).toHaveLength(2);
    });

    it('does not render the show previous button', async () => {
      const answers = [
        buildGeneratedAnswer({answerId: 'a1'}),
        buildGeneratedAnswer({answerId: 'a2'}),
      ];
      const element = createTestComponent({generatedAnswers: answers});
      await flushPromises();

      const button = element.shadowRoot.querySelector(
        selectors.showPreviousButton
      );
      expect(button).toBeNull();
    });

    it('sets the last thread item as non-collapsible', async () => {
      const answers = [
        buildGeneratedAnswer({answerId: 'a1'}),
        buildGeneratedAnswer({answerId: 'a2'}),
      ];
      const element = createTestComponent({generatedAnswers: answers});
      await flushPromises();

      const threadItems = element.shadowRoot.querySelectorAll(
        selectors.threadItem
      );
      const lastItem = threadItems[threadItems.length - 1];
      expect(lastItem.disableCollapse).toBe(true);
      expect(lastItem.hideLine).toBe(true);
    });

    it('sets the first thread item as collapsible and collapsed', async () => {
      const answers = [
        buildGeneratedAnswer({answerId: 'a1'}),
        buildGeneratedAnswer({answerId: 'a2'}),
      ];
      const element = createTestComponent({generatedAnswers: answers});
      await flushPromises();

      const threadItems = element.shadowRoot.querySelectorAll(
        selectors.threadItem
      );
      const firstItem = threadItems[0];
      expect(firstItem.disableCollapse).toBe(false);
      expect(firstItem.isExpanded).toBe(false);
      expect(firstItem.hideLine).toBe(false);
    });
  });

  describe('with three or more answers', () => {
    it('initially shows only the show previous button and the last answer', async () => {
      const answers = [
        buildGeneratedAnswer({answerId: 'a1', question: 'Q1'}),
        buildGeneratedAnswer({answerId: 'a2', question: 'Q2'}),
        buildGeneratedAnswer({answerId: 'a3', question: 'Q3'}),
      ];
      const element = createTestComponent({generatedAnswers: answers});
      await flushPromises();

      const button = element.shadowRoot.querySelector(
        selectors.showPreviousButton
      );
      const dot = element.shadowRoot.querySelector(selectors.showPreviousDot);
      expect(button).not.toBeNull();
      expect(dot).not.toBeNull();

      const threadItems = element.shadowRoot.querySelectorAll(
        selectors.threadItem
      );
      expect(threadItems).toHaveLength(1);
    });

    it('reveals all previous answers when the show previous button is clicked', async () => {
      const answers = [
        buildGeneratedAnswer({answerId: 'a1', question: 'Q1'}),
        buildGeneratedAnswer({answerId: 'a2', question: 'Q2'}),
        buildGeneratedAnswer({answerId: 'a3', question: 'Q3'}),
      ];
      const element = createTestComponent({generatedAnswers: answers});
      await flushPromises();

      const button = element.shadowRoot.querySelector(
        selectors.showPreviousButton
      );
      button.click();
      await flushPromises();

      const threadItems = element.shadowRoot.querySelectorAll(
        selectors.threadItem
      );
      expect(threadItems).toHaveLength(3);

      const showButton = element.shadowRoot.querySelector(
        selectors.showPreviousButton
      );
      expect(showButton).toBeNull();
    });

    it('sets previous answers as collapsible and collapsed after expansion', async () => {
      const answers = [
        buildGeneratedAnswer({answerId: 'a1', question: 'Q1'}),
        buildGeneratedAnswer({answerId: 'a2', question: 'Q2'}),
        buildGeneratedAnswer({answerId: 'a3', question: 'Q3'}),
      ];
      const element = createTestComponent({generatedAnswers: answers});
      await flushPromises();

      element.shadowRoot.querySelector(selectors.showPreviousButton).click();
      await flushPromises();

      const threadItems = element.shadowRoot.querySelectorAll(
        selectors.threadItem
      );
      const firstItem = threadItems[0];
      const secondItem = threadItems[1];

      expect(firstItem.disableCollapse).toBe(false);
      expect(firstItem.isExpanded).toBe(false);
      expect(secondItem.disableCollapse).toBe(false);
      expect(secondItem.isExpanded).toBe(false);
    });

    it('keeps the last answer expanded and non-collapsible after expansion', async () => {
      const answers = [
        buildGeneratedAnswer({answerId: 'a1', question: 'Q1'}),
        buildGeneratedAnswer({answerId: 'a2', question: 'Q2'}),
        buildGeneratedAnswer({answerId: 'a3', question: 'Q3'}),
      ];
      const element = createTestComponent({generatedAnswers: answers});
      await flushPromises();

      element.shadowRoot.querySelector(selectors.showPreviousButton).click();
      await flushPromises();

      const threadItems = element.shadowRoot.querySelectorAll(
        selectors.threadItem
      );
      const lastItem = threadItems[threadItems.length - 1];
      expect(lastItem.disableCollapse).toBe(true);
      expect(lastItem.hideLine).toBe(true);
    });

    it('re-collapses when a new follow-up answer is added', async () => {
      const answers = [
        buildGeneratedAnswer({answerId: 'a1', question: 'Q1'}),
        buildGeneratedAnswer({answerId: 'a2', question: 'Q2'}),
        buildGeneratedAnswer({answerId: 'a3', question: 'Q3'}),
      ];
      const element = createTestComponent({generatedAnswers: answers});
      await flushPromises();

      element.shadowRoot.querySelector(selectors.showPreviousButton).click();
      await flushPromises();

      expect(
        element.shadowRoot.querySelector(selectors.showPreviousButton)
      ).toBeNull();

      element.generatedAnswers = [
        ...answers,
        buildGeneratedAnswer({answerId: 'a4', question: 'Q4'}),
      ];
      await flushPromises();

      expect(
        element.shadowRoot.querySelector(selectors.showPreviousButton)
      ).not.toBeNull();
      expect(
        element.shadowRoot.querySelectorAll(selectors.threadItem)
      ).toHaveLength(1);
    });
  });

  describe('engine-id and citation anchoring passthrough', () => {
    it('passes engineId and disableCitationAnchoring to generated answer body', async () => {
      const answers = [buildGeneratedAnswer()];
      const element = createTestComponent({
        generatedAnswers: answers,
        engineId: 'custom-engine',
        disableCitationAnchoring: true,
      });
      await flushPromises();

      const body = element.shadowRoot.querySelector(
        selectors.generatedAnswerBody
      );
      expect(body.engineId).toBe('custom-engine');
      expect(body.disableCitationAnchoring).toBe(true);
    });
  });
});

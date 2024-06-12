// @ts-ignore
import QuanticGeneratedAnswerContent from 'c/quanticGeneratedAnswerContent';
import {createElement} from 'lwc';

const mockMarkedUse = jest.fn();
const mockMarkedParse = jest.fn((text) => text);
global.marked = {
  use: mockMarkedUse,
  parse: mockMarkedParse,
};

const defaultOptions = {
  isStreaming: false,
  answerContentFormat: 'text/plain',
  answer: '',
};

function createTestComponent(options = defaultOptions) {
  const element = createElement('c-quantic-generated-answer-content', {
    is: QuanticGeneratedAnswerContent,
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

describe('c-quantic-generated-answer-content', () => {
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

  describe('text/plain answer content', () => {
    it('should render a simple text/plain answer when not streaming', async () => {
      const element = createTestComponent({
        ...defaultOptions,
        answer: 'Hello, world!',
      });
      await flushPromises();

      const answerContent = element.shadowRoot.querySelector(
        'span.generated-answer-content__answer'
      );

      expect(answerContent.textContent).toBe('Hello, world!');
      expect(answerContent.className).toBe('generated-answer-content__answer');
    });

    it('should render a text/plain answer when streaming', async () => {
      const element = createTestComponent({
        ...defaultOptions,
        answer: 'Hello, world!',
        isStreaming: true,
      });
      await flushPromises();

      const answerContent = element.shadowRoot.querySelector(
        'span.generated-answer-content__answer'
      );

      expect(answerContent.textContent).toBe('Hello, world!');
      expect(answerContent.className).toContain(
        'generated-answer-content__answer--streaming'
      );
    });
  });

  describe('text/markdown answer content', () => {
    it('should render a simple markdown answer when not streaming', async () => {
      const element = createTestComponent({
        ...defaultOptions,
        answerContentFormat: 'text/markdown',
        answer: 'Hello, world!',
      });
      await flushPromises();

      const answerContent = element.shadowRoot.querySelector(
        'div.generated-answer-content__answer'
      );

      expect(answerContent.textContent).toBe('Hello, world!');
      expect(answerContent.className).toBe('generated-answer-content__answer');
    });

    it('should render a simple markdown answer when streaming', async () => {
      const element = createTestComponent({
        ...defaultOptions,
        answerContentFormat: 'text/markdown',
        answer: 'Hello, world!',
        isStreaming: true,
      });
      await flushPromises();

      const answerContent = element.shadowRoot.querySelector(
        'div.generated-answer-content__answer'
      );

      expect(answerContent.textContent).toBe('Hello, world!');
      expect(answerContent.className).toContain(
        'generated-answer-content__answer--streaming'
      );
    });
  });
});

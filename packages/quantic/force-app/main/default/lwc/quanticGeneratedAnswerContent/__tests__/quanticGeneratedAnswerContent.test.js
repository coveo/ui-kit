/* eslint-disable no-import-assign */
// @ts-ignore
import QuanticGeneratedAnswerContent from 'c/quanticGeneratedAnswerContent';
import {createElement} from 'lwc';
import {loadMarkdownDependencies} from 'c/quanticUtils';
import * as mockHeadlessLoader from 'c/quanticHeadlessLoader';

jest.mock('c/quanticHeadlessLoader');
jest.mock('c/quanticUtils', () => ({
  loadMarkdownDependencies: jest.fn(
    () =>
      new Promise((resolve) => {
        resolve();
      })
  ),
  transformMarkdownToHtml: jest.fn((value) => value),
  LinkUtils: {
    bindAnalyticsToLink: jest.fn(() => jest.fn()),
  },
}));

const mockMarkedUse = jest.fn();
const mockMarkedParse = jest.fn((text) => text);
global.marked = {
  use: mockMarkedUse,
  parse: mockMarkedParse,
};

const SELECTORS = {
  textAnswerContainer: 'span.generated-answer-content__answer',
  markdownAnswerContainer: 'div.generated-answer-content__answer',
  inlineLink: 'a[data-answer-inline-link]',
  inlineLinkIconContainer: 'span.slds-icon_container',
  inlineLinkIconSvg: 'svg.slds-icon',
};

const exampleEngineId = 'example-engine-id';
const exampleAnswerId = 'example-answer-id';

const defaultOptions = {
  isStreaming: false,
  answerContentFormat: 'text/plain',
  answer: '',
};

const exampleEngine = {id: 'dummy-engine'};
let isInitialized = false;

const mockBuildInteractiveGeneratedAnswerInlineLink = jest.fn(() => ({
  select: jest.fn(),
  beginDelayedSelect: jest.fn(),
  cancelPendingSelect: jest.fn(),
}));

function prepareHeadlessState() {
  // @ts-ignore
  mockHeadlessLoader.getHeadlessBundle = () => ({
    buildInteractiveGeneratedAnswerInlineLink:
      mockBuildInteractiveGeneratedAnswerInlineLink,
  });
}

function mockSuccessfulHeadlessInitialization() {
  // @ts-ignore
  mockHeadlessLoader.initializeWithHeadless = (element, _, initialize) => {
    if (element instanceof QuanticGeneratedAnswerContent && !isInitialized) {
      isInitialized = true;
      initialize(exampleEngine);
    }
  };
}

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

/**
 * Builds an HTML string containing anchor tags with the data-answer-inline-link
 * attribute, which is what the component's processInlineLinks method targets.
 * @param {Array<{href: string, text: string}>} links
 * @returns {string}
 */
function buildAnswerWithInlineLinks(links) {
  return links
    .map(
      ({href, text}) => `<a href="${href}" data-answer-inline-link>${text}</a>`
    )
    .join(' ');
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
    isInitialized = false;
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
        SELECTORS.textAnswerContainer
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
        SELECTORS.textAnswerContainer
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
        SELECTORS.markdownAnswerContainer
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
        SELECTORS.markdownAnswerContainer
      );

      expect(answerContent.textContent).toBe('Hello, world!');
      expect(answerContent.className).toContain(
        'generated-answer-content__answer--streaming'
      );
    });
  });

  describe('the reactivity of the answerContentFormat property', () => {
    it('should load the markdown dependencies when the answerContentFormat property is changed to text/markdown', async () => {
      const element = createTestComponent({
        ...defaultOptions,
        answerContentFormat: 'text/plain',
      });
      await flushPromises();
      expect(loadMarkdownDependencies).not.toHaveBeenCalled();

      element.answerContentFormat = 'text/markdown';
      await flushPromises();
      expect(loadMarkdownDependencies).toHaveBeenCalled();
    });
  });

  describe('inline links in a markdown answer', () => {
    const exampleLinks = [
      {href: 'https://example.com/1', text: 'Link one'},
      {href: 'https://example.com/2', text: 'Link two'},
    ];

    beforeEach(() => {
      mockSuccessfulHeadlessInitialization();
      prepareHeadlessState();
    });

    describe('when the answer contains anchors with data-answer-inline-link', () => {
      it('should set target="_blank" and append an icon span to each inline link anchor', async () => {
        const {LinkUtils} = jest.requireMock('c/quanticUtils');
        LinkUtils.bindAnalyticsToLink.mockReturnValue(jest.fn());

        const element = createTestComponent({
          ...defaultOptions,
          engineId: exampleEngineId,
          answerId: exampleAnswerId,
          answerContentFormat: 'text/markdown',
          answer: buildAnswerWithInlineLinks(exampleLinks),
        });
        await flushPromises();

        const answerContainer = element.shadowRoot.querySelector(
          SELECTORS.markdownAnswerContainer
        );
        const anchors = answerContainer.querySelectorAll(SELECTORS.inlineLink);

        expect(anchors).toHaveLength(exampleLinks.length);
        anchors.forEach((anchor) => {
          expect(anchor.target).toBe('_blank');
        });
        anchors.forEach((anchor) => {
          const iconSpan = anchor.querySelector(
            SELECTORS.inlineLinkIconContainer
          );
          expect(iconSpan).not.toBeNull();
          expect(iconSpan.classList).toContain('slds-icon-utility-new_window');
          expect(iconSpan.classList).toContain('slds-current-color');
          expect(
            iconSpan.querySelector(SELECTORS.inlineLinkIconSvg)
          ).not.toBeNull();
        });
      });

      it('should call buildInteractiveGeneratedAnswerInlineLink with the correct parameters for each inline link', async () => {
        const {LinkUtils} = jest.requireMock('c/quanticUtils');
        LinkUtils.bindAnalyticsToLink.mockReturnValue(jest.fn());

        createTestComponent({
          ...defaultOptions,
          engineId: exampleEngineId,
          answerId: exampleAnswerId,
          answerContentFormat: 'text/markdown',
          answer: buildAnswerWithInlineLinks(exampleLinks),
        });
        await flushPromises();

        expect(
          mockBuildInteractiveGeneratedAnswerInlineLink
        ).toHaveBeenCalledTimes(exampleLinks.length);
        expect(LinkUtils.bindAnalyticsToLink).toHaveBeenCalledTimes(
          exampleLinks.length
        );

        exampleLinks.forEach((anchor, index) => {
          expect(
            mockBuildInteractiveGeneratedAnswerInlineLink
          ).toHaveBeenNthCalledWith(index + 1, exampleEngine, {
            options: {
              link: {
                linkURL: anchor.href,
                linkText: anchor.text,
              },
              answerId: exampleAnswerId,
            },
          });
        });
      });

      it('should call LinkUtils.bindAnalyticsToLink for each inline link with the anchor and its controller', async () => {
        const {LinkUtils} = jest.requireMock('c/quanticUtils');
        const mockUnbind = jest.fn();
        LinkUtils.bindAnalyticsToLink.mockReturnValue(mockUnbind);

        const element = createTestComponent({
          ...defaultOptions,
          engineId: exampleEngineId,
          answerId: exampleAnswerId,
          answerContentFormat: 'text/markdown',
          answer: buildAnswerWithInlineLinks(exampleLinks),
        });
        await flushPromises();

        expect(LinkUtils.bindAnalyticsToLink).toHaveBeenCalledTimes(
          exampleLinks.length
        );

        const answerContainer = element.shadowRoot.querySelector(
          SELECTORS.markdownAnswerContainer
        );
        const anchors = Array.from(
          answerContainer.querySelectorAll(SELECTORS.inlineLink)
        );

        anchors.forEach((anchor, index) => {
          expect(LinkUtils.bindAnalyticsToLink).toHaveBeenNthCalledWith(
            index + 1,
            anchor,
            expect.objectContaining({
              select: expect.any(Function),
              beginDelayedSelect: expect.any(Function),
              cancelPendingSelect: expect.any(Function),
            })
          );
        });
      });
    });

    describe('when the answer does not contain anchors with data-answer-inline-link', () => {
      it('should not call buildInteractiveGeneratedAnswerInlineLink and LinkUtils.bindAnalyticsToLink', async () => {
        const {LinkUtils} = jest.requireMock('c/quanticUtils');

        createTestComponent({
          ...defaultOptions,
          engineId: exampleEngineId,
          answerId: exampleAnswerId,
          answerContentFormat: 'text/markdown',
          answer: '<p>No inline links here</p>',
        });
        await flushPromises();

        expect(
          mockBuildInteractiveGeneratedAnswerInlineLink
        ).not.toHaveBeenCalled();
        expect(LinkUtils.bindAnalyticsToLink).not.toHaveBeenCalled();
      });
    });

    describe('when the headless bundle does not expose buildInteractiveGeneratedAnswerInlineLink', () => {
      it('should not throw and should not call LinkUtils.bindAnalyticsToLink', async () => {
        // @ts-ignore
        mockHeadlessLoader.getHeadlessBundle = () => ({});
        const {LinkUtils} = jest.requireMock('c/quanticUtils');

        expect(() => {
          createTestComponent({
            ...defaultOptions,
            engineId: exampleEngineId,
            answerId: exampleAnswerId,
            answerContentFormat: 'text/markdown',
            answer: buildAnswerWithInlineLinks(exampleLinks),
          });
        }).not.toThrow();

        await flushPromises();

        expect(LinkUtils.bindAnalyticsToLink).not.toHaveBeenCalled();
      });
    });

    describe('when the answer is updated', () => {
      it('should clean up previous inline link bindings before processing the new answer', async () => {
        const {LinkUtils} = jest.requireMock('c/quanticUtils');
        const mockUnbind = jest.fn();
        LinkUtils.bindAnalyticsToLink.mockReturnValue(mockUnbind);

        const element = createTestComponent({
          ...defaultOptions,
          engineId: exampleEngineId,
          answerId: exampleAnswerId,
          answerContentFormat: 'text/markdown',
          answer: buildAnswerWithInlineLinks(exampleLinks),
        });
        await flushPromises();

        expect(mockUnbind).not.toHaveBeenCalled();

        const updatedLinks = [
          {href: 'https://example.com/3', text: 'Link three'},
        ];
        element.answer = buildAnswerWithInlineLinks(updatedLinks);
        await flushPromises();

        expect(mockUnbind).toHaveBeenCalledTimes(exampleLinks.length);
      });
    });

    describe('when the component is disconnected', () => {
      it('should call the unbind function for each inline link binding', async () => {
        const {LinkUtils} = jest.requireMock('c/quanticUtils');
        const mockUnbind = jest.fn();
        LinkUtils.bindAnalyticsToLink.mockReturnValue(mockUnbind);

        const element = createTestComponent({
          ...defaultOptions,
          engineId: exampleEngineId,
          answerId: exampleAnswerId,
          answerContentFormat: 'text/markdown',
          answer: buildAnswerWithInlineLinks(exampleLinks),
        });
        await flushPromises();

        expect(mockUnbind).not.toHaveBeenCalled();

        document.body.removeChild(element);
        await flushPromises();

        expect(mockUnbind).toHaveBeenCalledTimes(exampleLinks.length);
      });
    });
  });
});

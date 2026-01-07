import {
  buildSmartSnippet as buildInsightSmartSnippet,
  type SmartSnippet as InsightSmartSnippet,
  type SmartSnippetState as InsightSmartSnippetState,
} from '@coveo/headless/insight';
import {html} from 'lit';
import {beforeEach, describe, expect, it, vi} from 'vitest';
import {renderInAtomicInsightInterface} from '@/vitest-utils/testing-helpers/fixtures/atomic/insight/atomic-insight-interface-fixture.js';
import {buildFakeInsightEngine} from '@/vitest-utils/testing-helpers/fixtures/headless/insight/engine.js';
import {buildFakeSmartSnippet} from '@/vitest-utils/testing-helpers/fixtures/headless/insight/smart-snippet-controller.js';
import type {AtomicInsightSmartSnippet} from './atomic-insight-smart-snippet.js';
import './atomic-insight-smart-snippet.js';

vi.mock('@coveo/headless/insight', {spy: true});

describe('atomic-insight-smart-snippet', () => {
  let mockEngine: ReturnType<typeof buildFakeInsightEngine>;
  let mockSmartSnippet: InsightSmartSnippet;

  const renderComponent = async ({
    props = {},
    controllerState = {},
  }: {
    props?: Partial<{
      headingLevel: number;
      maximumHeight: number;
      collapsedHeight: number;
      snippetStyle: string;
    }>;
    controllerState?: Partial<InsightSmartSnippetState>;
  } = {}) => {
    mockSmartSnippet = buildFakeSmartSnippet({state: controllerState});
    vi.mocked(buildInsightSmartSnippet).mockReturnValue(mockSmartSnippet);

    const {element, atomicInterface} =
      await renderInAtomicInsightInterface<AtomicInsightSmartSnippet>({
        template: html`<atomic-insight-smart-snippet
          .headingLevel=${props.headingLevel ?? 0}
          .maximumHeight=${props.maximumHeight ?? 250}
          .collapsedHeight=${props.collapsedHeight ?? 180}
          .snippetStyle=${props.snippetStyle}
        ></atomic-insight-smart-snippet>`,
        selector: 'atomic-insight-smart-snippet',
        bindings: (bindings) => {
          bindings.engine = mockEngine;
          return bindings;
        },
      });

    const shadow = element.shadowRoot;

    return {
      element,
      atomicInterface,
      smartSnippet:
        shadow?.querySelector<HTMLElement>('[part="smart-snippet"]') ?? null,
      question: shadow?.querySelector<HTMLElement>('[part="question"]') ?? null,
      expandableAnswer:
        shadow?.querySelector('atomic-smart-snippet-expandable-answer') ?? null,
      feedbackBanner:
        shadow?.querySelector<HTMLElement>('[part="feedback-banner"]') ?? null,
      source:
        shadow?.querySelector<HTMLElement>('atomic-smart-snippet-source') ??
        null,
      likeButton:
        shadow?.querySelector<HTMLInputElement>(
          '[part="feedback-like-button"] input[type="radio"]'
        ) ?? null,
      dislikeButton:
        shadow?.querySelector<HTMLInputElement>(
          '[part="feedback-dislike-button"] input[type="radio"]'
        ) ?? null,
      thankYouMessage:
        shadow?.querySelector<HTMLElement>('[part="feedback-thank-you"]') ??
        null,
      explainWhyButton:
        shadow?.querySelector<HTMLElement>(
          '[part="feedback-explain-why-button"]'
        ) ?? null,
      feedbackModal:
        element.renderRoot.parentElement?.querySelector(
          'atomic-insight-smart-snippet-feedback-modal'
        ) ?? null,
    };
  };

  beforeEach(() => {
    mockEngine = buildFakeInsightEngine();
  });

  describe('#initialize', () => {
    it('should build the SmartSnippet controller and bind state', async () => {
      const {element} = await renderComponent({
        controllerState: {
          question: 'Test question?',
          answer: 'Test answer',
          answerFound: true,
        },
      });

      expect(buildInsightSmartSnippet).toHaveBeenCalledWith(mockEngine);
      expect(element.smartSnippet).toBe(mockSmartSnippet);
      expect(element.smartSnippetState.question).toBe('Test question?');
      expect(element.smartSnippetState.answer).toBe('Test answer');
      expect(element.smartSnippetState.answerFound).toBe(true);
    });
  });

  describe('when answer is found', () => {
    it('should render smart snippet components and not have atomic-hidden class', async () => {
      const {
        element,
        smartSnippet,
        question,
        expandableAnswer,
        feedbackBanner,
      } = await renderComponent({
        controllerState: {answerFound: true, question: 'What is AI?'},
      });

      await expect.element(smartSnippet).toBeInTheDocument();
      await expect.element(question).toBeInTheDocument();
      await expect.element(expandableAnswer).toBeInTheDocument();
      await expect.element(feedbackBanner).toBeInTheDocument();
      expect(element.classList.contains('atomic-hidden')).toBe(false);
    });

    it('should render source when available', async () => {
      const {source} = await renderComponent({
        controllerState: {
          answerFound: true,
          source: {
            title: 'Test Document',
            uri: 'https://example.com/doc',
            permanentid: 'test-id',
            clickUri: 'https://example.com/doc',
            uniqueId: 'unique-id',
          } as unknown as InsightSmartSnippetState['source'],
        },
      });

      await expect.element(source).toBeInTheDocument();
    });

    it('should not render source when unavailable', async () => {
      const {source} = await renderComponent({
        controllerState: {answerFound: true, source: undefined},
      });

      expect(source).toBeNull();
    });
  });

  describe('when answer is not found', () => {
    it('should not render smart snippet and add atomic-hidden class', async () => {
      const {element, smartSnippet} = await renderComponent({
        controllerState: {answerFound: false},
      });

      expect(smartSnippet).toBeNull();
      expect(element.classList.contains('atomic-hidden')).toBe(true);
    });
  });

  describe('properties', () => {
    it('should pass props to element and expandable answer', async () => {
      const snippetStyle = 'b { color: blue; }';
      const {element, expandableAnswer} = await renderComponent({
        props: {
          headingLevel: 3,
          maximumHeight: 300,
          collapsedHeight: 200,
          snippetStyle,
        },
        controllerState: {answerFound: true},
      });

      expect(element.headingLevel).toBe(3);
      expect(element.maximumHeight).toBe(300);
      expect(element.collapsedHeight).toBe(200);
      expect(element.snippetStyle).toBe(snippetStyle);

      const answer = expandableAnswer as unknown as {
        collapsedHeight: number;
        maximumHeight: number;
        snippetStyle: string;
      };
      expect(answer?.collapsedHeight).toBe(200);
      expect(answer?.maximumHeight).toBe(300);
      expect(answer?.snippetStyle).toBe(snippetStyle);
    });

    it('should pass expanded state and answer content to expandable answer', async () => {
      const answer = '<p>Test answer content</p>';
      const {expandableAnswer} = await renderComponent({
        controllerState: {answerFound: true, expanded: true, answer},
      });

      const expandableAnswerElement = expandableAnswer as unknown as {
        expanded: boolean;
        htmlContent: string;
      };
      expect(expandableAnswerElement?.expanded).toBe(true);
      expect(expandableAnswerElement?.htmlContent).toBe(answer);
    });
  });

  describe('feedback interactions', () => {
    it('should call like() when like button is clicked', async () => {
      const {element, likeButton} = await renderComponent({
        controllerState: {answerFound: true},
      });

      const likeSpy = vi.fn();
      element.smartSnippet.like = likeSpy;
      likeButton?.click();

      expect(likeSpy).toHaveBeenCalled();
    });

    it('should call dislike() when dislike button is clicked', async () => {
      const {element, dislikeButton} = await renderComponent({
        controllerState: {answerFound: true},
      });

      const dislikeSpy = vi.fn();
      element.smartSnippet.dislike = dislikeSpy;
      dislikeButton?.click();

      expect(dislikeSpy).toHaveBeenCalled();
    });

    it('should show thank you message when liked or disliked', async () => {
      const likedResult = await renderComponent({
        controllerState: {answerFound: true, liked: true},
      });
      await expect.element(likedResult.thankYouMessage).toBeInTheDocument();

      const dislikedResult = await renderComponent({
        controllerState: {answerFound: true, disliked: true},
      });
      await expect.element(dislikedResult.thankYouMessage).toBeInTheDocument();
    });

    it('should show explain why button only when disliked', async () => {
      const dislikedResult = await renderComponent({
        controllerState: {answerFound: true, disliked: true},
      });
      await expect.element(dislikedResult.explainWhyButton).toBeInTheDocument();

      const likedResult = await renderComponent({
        controllerState: {answerFound: true, liked: true},
      });
      expect(likedResult.explainWhyButton).toBeNull();
    });
  });

  describe('willUpdate lifecycle', () => {
    it('should reset feedbackSent when neither liked nor disliked', async () => {
      const {element} = await renderComponent({
        controllerState: {answerFound: true, liked: false, disliked: false},
      });

      (element as unknown as {feedbackSent: boolean}).feedbackSent = true;
      element.requestUpdate();
      await element.updateComplete;

      expect((element as unknown as {feedbackSent: boolean}).feedbackSent).toBe(
        false
      );
    });

    it('should not reset feedbackSent when liked or disliked', async () => {
      const likedResult = await renderComponent({
        controllerState: {answerFound: true, liked: true},
      });
      (likedResult.element as unknown as {feedbackSent: boolean}).feedbackSent =
        true;
      likedResult.element.requestUpdate();
      await likedResult.element.updateComplete;
      expect(
        (likedResult.element as unknown as {feedbackSent: boolean}).feedbackSent
      ).toBe(true);

      const dislikedResult = await renderComponent({
        controllerState: {answerFound: true, disliked: true},
      });
      (
        dislikedResult.element as unknown as {feedbackSent: boolean}
      ).feedbackSent = true;
      dislikedResult.element.requestUpdate();
      await dislikedResult.element.updateComplete;
      expect(
        (dislikedResult.element as unknown as {feedbackSent: boolean})
          .feedbackSent
      ).toBe(true);
    });
  });

  describe('expand/collapse interactions', () => {
    it('should call expand() when expand event is triggered', async () => {
      const {element, expandableAnswer} = await renderComponent({
        controllerState: {answerFound: true},
      });

      const expandSpy = vi.fn();
      element.smartSnippet.expand = expandSpy;
      expandableAnswer?.dispatchEvent(
        new CustomEvent('expand', {bubbles: true, composed: true})
      );
      await element.updateComplete;

      expect(expandSpy).toHaveBeenCalled();
    });

    it('should call collapse() when collapse event is triggered', async () => {
      const {element, expandableAnswer} = await renderComponent({
        controllerState: {answerFound: true, expanded: true},
      });

      const collapseSpy = vi.fn();
      element.smartSnippet.collapse = collapseSpy;
      expandableAnswer?.dispatchEvent(
        new CustomEvent('collapse', {bubbles: true, composed: true})
      );
      await element.updateComplete;

      expect(collapseSpy).toHaveBeenCalled();
    });
  });

  describe('feedback modal', () => {
    it('should create modal when dislike is clicked and open on explain why click', async () => {
      const {element, dislikeButton, explainWhyButton} = await renderComponent({
        controllerState: {answerFound: true, disliked: true},
      });

      element.smartSnippet.dislike = vi.fn();
      dislikeButton?.click();
      await element.updateComplete;

      const modal = element.renderRoot.parentElement?.querySelector(
        'atomic-insight-smart-snippet-feedback-modal'
      );
      expect(modal).not.toBeNull();
      expect(explainWhyButton).not.toBeNull();

      explainWhyButton?.click();
      await element.updateComplete;

      const modalAfterClick = element.renderRoot.parentElement?.querySelector(
        'atomic-insight-smart-snippet-feedback-modal'
      );
      expect(modalAfterClick).not.toBeNull();
      expect(modalAfterClick?.parentElement).not.toBeNull();
    });
  });

  it('should pass source data to source component', async () => {
    const sourceData = {
      title: 'Test Document',
      uri: 'https://example.com/doc',
      permanentid: 'test-id',
      clickUri: 'https://example.com/doc',
      uniqueId: 'unique-id',
    } as unknown as InsightSmartSnippetState['source'];

    const {source} = await renderComponent({
      controllerState: {answerFound: true, source: sourceData},
    });

    const sourceComponent = source as unknown as {
      source: InsightSmartSnippetState['source'];
    };
    expect(sourceComponent?.source).toBe(sourceData);
  });
});

import {
  buildSmartSnippet as buildInsightSmartSnippet,
  type SmartSnippet as InsightSmartSnippet,
  type SmartSnippetState as InsightSmartSnippetState,
} from '@coveo/headless/insight';
import {html} from 'lit';
import {beforeEach, describe, expect, it, vi} from 'vitest';
import {page} from 'vitest/browser';
import {fixture} from '@/vitest-utils/testing-helpers/fixture.js';
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

    const element = await fixture<AtomicInsightSmartSnippet>(
      html`<atomic-insight-smart-snippet
        .headingLevel=${props.headingLevel ?? 0}
        .maximumHeight=${props.maximumHeight ?? 250}
        .collapsedHeight=${props.collapsedHeight ?? 180}
        .snippetStyle=${props.snippetStyle}
      ></atomic-insight-smart-snippet>`
    );

    // Mock the bindings
    element.bindings = {
      engine: mockEngine,
      i18n: {
        t: (key: string) => key,
      } as never,
      store: {} as never,
      interfaceElement: {} as never,
      createStyleElement: vi.fn(),
      createScriptElement: vi.fn(),
    };

    // Initialize the component
    element.initialize();
    await element.updateComplete;

    return {
      element,
      parts: (el: AtomicInsightSmartSnippet) => ({
        smartSnippet: el.shadowRoot?.querySelector('[part="smart-snippet"]'),
        body: el.shadowRoot?.querySelector('[part="body"]'),
      }),
    };
  };

  beforeEach(() => {
    mockEngine = buildFakeInsightEngine();
  });

  describe('#initialize', () => {
    it('should build the SmartSnippet controller', async () => {
      const {element} = await renderComponent();

      expect(buildInsightSmartSnippet).toHaveBeenCalledWith(mockEngine);
      expect(element.smartSnippet).toBe(mockSmartSnippet);
    });

    it('should bind state to controller', async () => {
      const {element} = await renderComponent({
        controllerState: {
          question: 'Test question?',
          answer: 'Test answer',
          answerFound: true,
        },
      });

      expect(element.smartSnippetState.question).toBe('Test question?');
      expect(element.smartSnippetState.answer).toBe('Test answer');
      expect(element.smartSnippetState.answerFound).toBe(true);
    });
  });

  describe('rendering', () => {
    describe('when answer is found', () => {
      it('should render the smart snippet', async () => {
        const {parts, element} = await renderComponent({
          controllerState: {answerFound: true},
        });

        await expect.element(parts(element).smartSnippet).toBeInTheDocument();
      });

      it('should render the question', async () => {
        const {element} = await renderComponent({
          controllerState: {
            answerFound: true,
            question: 'What is AI?',
          },
        });

        const questionElement = element.shadowRoot?.querySelector(
          'h1, h2, h3, h4, h5, h6'
        );
        await expect.element(questionElement).toBeInTheDocument();
      });

      it('should render the expandable answer', async () => {
        const {element} = await renderComponent({
          controllerState: {answerFound: true},
        });

        const answerElement = element.shadowRoot?.querySelector(
          'atomic-smart-snippet-expandable-answer'
        );
        await expect.element(answerElement).toBeInTheDocument();
      });

      it('should render the feedback banner', async () => {
        const {element} = await renderComponent({
          controllerState: {answerFound: true},
        });

        const feedbackBanner = element.shadowRoot?.querySelector(
          '[part="feedback-banner"]'
        );
        await expect.element(feedbackBanner).toBeInTheDocument();
      });
    });

    describe('when answer is not found', () => {
      it('should not render the smart snippet', async () => {
        const {element} = await renderComponent({
          controllerState: {answerFound: false},
        });

        const content = element.shadowRoot?.textContent?.trim();
        expect(content).toBe('');
      });
    });

    describe('when source is available', () => {
      it('should render the source link', async () => {
        const {element} = await renderComponent({
          controllerState: {
            answerFound: true,
            source: {
              title: 'Test Document',
              uri: 'https://example.com/doc',
              permanentid: 'test-id',
              clickUri: 'https://example.com/doc',
              uniqueId: 'unique-id',
            },
          },
        });

        const sourceElement = element.shadowRoot?.querySelector(
          'atomic-stencil-smart-snippet-source'
        );
        await expect.element(sourceElement).toBeInTheDocument();
      });
    });

    describe('when source is not available', () => {
      it('should not render the source link', async () => {
        const {element} = await renderComponent({
          controllerState: {
            answerFound: true,
            source: undefined,
          },
        });

        const sourceElement = element.shadowRoot?.querySelector(
          'atomic-stencil-smart-snippet-source'
        );
        expect(sourceElement).toBeNull();
      });
    });
  });

  describe('properties', () => {
    it('should accept headingLevel prop', async () => {
      const {element} = await renderComponent({
        props: {headingLevel: 3},
        controllerState: {answerFound: true},
      });

      expect(element.headingLevel).toBe(3);
    });

    it('should accept maximumHeight prop', async () => {
      const {element} = await renderComponent({
        props: {maximumHeight: 300},
        controllerState: {answerFound: true},
      });

      expect(element.maximumHeight).toBe(300);
    });

    it('should accept collapsedHeight prop', async () => {
      const {element} = await renderComponent({
        props: {collapsedHeight: 200},
        controllerState: {answerFound: true},
      });

      expect(element.collapsedHeight).toBe(200);
    });

    it('should accept snippetStyle prop', async () => {
      const customStyle = 'b { color: blue; }';
      const {element} = await renderComponent({
        props: {snippetStyle: customStyle},
        controllerState: {answerFound: true},
      });

      expect(element.snippetStyle).toBe(customStyle);
    });
  });

  describe('feedback interactions', () => {
    it('should call like() when like button is clicked', async () => {
      const likeSpy = vi.fn();
      mockSmartSnippet.like = likeSpy;

      await renderComponent({
        controllerState: {answerFound: true},
      });

      const likeButton = page.getByRole('radio', {name: 'yes'});
      await likeButton.click();

      expect(likeSpy).toHaveBeenCalled();
    });

    it('should call dislike() when dislike button is clicked', async () => {
      const dislikeSpy = vi.fn();
      mockSmartSnippet.dislike = dislikeSpy;

      await renderComponent({
        controllerState: {answerFound: true},
      });

      const dislikeButton = page.getByRole('radio', {name: 'no'});
      await dislikeButton.click();

      expect(dislikeSpy).toHaveBeenCalled();
    });

    it('should show thank you message when liked', async () => {
      const {element} = await renderComponent({
        controllerState: {
          answerFound: true,
          liked: true,
        },
      });

      const thankYouMessage = element.shadowRoot?.querySelector(
        '[part="feedback-thank-you"]'
      );
      await expect.element(thankYouMessage).toBeInTheDocument();
    });

    it('should show thank you message when disliked', async () => {
      const {element} = await renderComponent({
        controllerState: {
          answerFound: true,
          disliked: true,
        },
      });

      const thankYouMessage = element.shadowRoot?.querySelector(
        '[part="feedback-thank-you"]'
      );
      await expect.element(thankYouMessage).toBeInTheDocument();
    });
  });

  describe('willUpdate lifecycle', () => {
    it('should reset feedbackSent when neither liked nor disliked', async () => {
      const {element} = await renderComponent({
        controllerState: {
          answerFound: true,
          liked: false,
          disliked: false,
        },
      });

      // Manually set feedbackSent to true using type assertion
      (element as unknown as {feedbackSent: boolean}).feedbackSent = true;

      // Trigger update
      element.requestUpdate();
      await element.updateComplete;

      // feedbackSent should be reset
      expect((element as unknown as {feedbackSent: boolean}).feedbackSent).toBe(
        false
      );
    });

    it('should not reset feedbackSent when liked', async () => {
      const {element} = await renderComponent({
        controllerState: {
          answerFound: true,
          liked: true,
        },
      });

      (element as unknown as {feedbackSent: boolean}).feedbackSent = true;
      element.requestUpdate();
      await element.updateComplete;

      expect((element as unknown as {feedbackSent: boolean}).feedbackSent).toBe(
        true
      );
    });

    it('should not reset feedbackSent when disliked', async () => {
      const {element} = await renderComponent({
        controllerState: {
          answerFound: true,
          disliked: true,
        },
      });

      (element as unknown as {feedbackSent: boolean}).feedbackSent = true;
      element.requestUpdate();
      await element.updateComplete;

      expect((element as unknown as {feedbackSent: boolean}).feedbackSent).toBe(
        true
      );
    });
  });

  describe('expand/collapse interactions', () => {
    it('should call expand() when expand event is triggered', async () => {
      const expandSpy = vi.fn();
      mockSmartSnippet.expand = expandSpy;

      const {element} = await renderComponent({
        controllerState: {answerFound: true},
      });

      const expandableAnswer = element.shadowRoot?.querySelector(
        'atomic-smart-snippet-expandable-answer'
      );
      expandableAnswer?.dispatchEvent(new CustomEvent('expand'));
      await element.updateComplete;

      expect(expandSpy).toHaveBeenCalled();
    });

    it('should call collapse() when collapse event is triggered', async () => {
      const collapseSpy = vi.fn();
      mockSmartSnippet.collapse = collapseSpy;

      const {element} = await renderComponent({
        controllerState: {
          answerFound: true,
          expanded: true,
        },
      });

      const expandableAnswer = element.shadowRoot?.querySelector(
        'atomic-smart-snippet-expandable-answer'
      );
      expandableAnswer?.dispatchEvent(new CustomEvent('collapse'));
      await element.updateComplete;

      expect(collapseSpy).toHaveBeenCalled();
    });
  });
});

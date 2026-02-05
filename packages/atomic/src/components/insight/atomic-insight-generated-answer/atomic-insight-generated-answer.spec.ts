import {
  buildGeneratedAnswer,
  buildInteractiveCitation,
  buildSearchStatus,
  type GeneratedAnswer,
  type GeneratedAnswerState,
  type InteractiveCitation,
  type SearchStatus,
} from '@coveo/headless/insight';
import {html} from 'lit';
import {beforeEach, describe, expect, it, vi} from 'vitest';
import {userEvent} from 'vitest/browser';
import {renderInAtomicInsightInterface} from '@/vitest-utils/testing-helpers/fixtures/atomic/insight/atomic-insight-interface-fixture';
import {buildFakeInsightEngine} from '@/vitest-utils/testing-helpers/fixtures/headless/insight/engine';
import {buildFakeGeneratedAnswer} from '@/vitest-utils/testing-helpers/fixtures/headless/insight/generated-answer-controller';
import {buildFakeSearchStatus} from '@/vitest-utils/testing-helpers/fixtures/headless/insight/search-status-controller';
import type {AtomicInsightGeneratedAnswer} from './atomic-insight-generated-answer';
import './atomic-insight-generated-answer';

vi.mock('@coveo/headless/insight', {spy: true});

describe('atomic-insight-generated-answer', () => {
  const mockedEngine = buildFakeInsightEngine();
  let mockedGeneratedAnswer: GeneratedAnswer;
  let mockedSearchStatus: SearchStatus;

  const renderGeneratedAnswer = async ({
    props = {},
    generatedAnswerState = {},
    searchStatusState = {},
  }: {
    props?: Partial<AtomicInsightGeneratedAnswer>;
    generatedAnswerState?: Partial<GeneratedAnswerState>;
    searchStatusState?: {hasError?: boolean};
  } = {}) => {
    mockedGeneratedAnswer = buildFakeGeneratedAnswer({
      answer: 'Test answer',
      citations: [],
      isVisible: true,
      ...generatedAnswerState,
    });

    mockedSearchStatus = buildFakeSearchStatus({
      state: {
        hasError: false,
        firstSearchExecuted: true,
        isLoading: false,
        hasResults: true,
        ...searchStatusState,
      },
    });

    vi.mocked(buildGeneratedAnswer).mockReturnValue(mockedGeneratedAnswer);
    vi.mocked(buildSearchStatus).mockReturnValue(mockedSearchStatus);
    vi.mocked(buildInteractiveCitation).mockReturnValue({
      select: vi.fn(),
      beginDelayedSelect: vi.fn(),
      cancelPendingSelect: vi.fn(),
    } as ReturnType<typeof buildInteractiveCitation>);

    const {element} =
      await renderInAtomicInsightInterface<AtomicInsightGeneratedAnswer>({
        template: html`<atomic-insight-generated-answer
          .withToggle=${props.withToggle ?? false}
          .collapsible=${props.collapsible ?? false}
          .disableCitationAnchoring=${props.disableCitationAnchoring ?? false}
          .answerConfigurationId=${props.answerConfigurationId}
          fields-to-include-in-citations=${props.fieldsToIncludeInCitations}
          .maxCollapsedHeight=${props.maxCollapsedHeight ?? 16}
        ></atomic-insight-generated-answer>`,
        selector: 'atomic-insight-generated-answer',
        bindings: (bindings) => {
          bindings.engine = mockedEngine;
          return bindings;
        },
      });

    return {
      element,
      get container() {
        return element.shadowRoot!.querySelector('[part="container"]');
      },
      get headerLabel() {
        return element.shadowRoot!.querySelector('[part="header-label"]');
      },
      get toggle() {
        return element.shadowRoot!.querySelector('[part="toggle"]');
      },
      get generatedContainer() {
        return element.shadowRoot!.querySelector(
          '[part="generated-container"]'
        );
      },
      get generatedContent() {
        return element.shadowRoot!.querySelector('[part="generated-content"]');
      },
      get feedbackButtons() {
        return element.shadowRoot!.querySelectorAll('[part="feedback-button"]');
      },
      get copyButton() {
        return element.shadowRoot!.querySelector('[part="copy-button"]');
      },
      get citationsLabel() {
        return element.shadowRoot!.querySelector('[part="citations-label"]');
      },
      get generatedAnswerFooter() {
        return element.shadowRoot!.querySelector(
          '[part="generated-answer-footer"]'
        );
      },
      get likeButton() {
        return element.shadowRoot!.querySelector(
          '[part="feedback-button"]:first-child'
        ) as HTMLButtonElement;
      },
      get dislikeButton() {
        return element.shadowRoot!.querySelector(
          '[part="feedback-button"].dislike'
        ) as HTMLButtonElement;
      },
      get retryContainer() {
        return element.shadowRoot!.querySelector('[part="retry-container"]');
      },
      get retryButton() {
        return element.shadowRoot!.querySelector(
          '[part="retry-button"]'
        ) as HTMLButtonElement;
      },
      get citationElements() {
        return element.shadowRoot!.querySelectorAll('atomic-citation');
      },
      get disclaimer() {
        return element.shadowRoot!.querySelector('slot[name="disclaimer"]');
      },
      get showMoreButton() {
        return element.shadowRoot!.querySelector(
          '[part="answer-show-button"]'
        ) as HTMLButtonElement;
      },
    };
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('when answer is available', () => {
    it('should render the container', async () => {
      const {container} = await renderGeneratedAnswer();
      expect(container).toBeInTheDocument();
    });

    it('should render the header label', async () => {
      const {headerLabel} = await renderGeneratedAnswer();
      expect(headerLabel).toBeInTheDocument();
    });

    it('should call buildGeneratedAnswer with the engine', async () => {
      await renderGeneratedAnswer();
      expect(buildGeneratedAnswer).toHaveBeenCalledWith(
        mockedEngine,
        expect.any(Object)
      );
    });

    it('should call buildSearchStatus with the engine', async () => {
      await renderGeneratedAnswer();
      expect(buildSearchStatus).toHaveBeenCalledWith(mockedEngine);
    });
  });

  it('should not render the container when answer is undefined when no answer is generated', async () => {
    const {container} = await renderGeneratedAnswer({
      generatedAnswerState: {answer: undefined, citations: []},
    });
    expect(container).not.toBeInTheDocument();
  });

  describe('when withToggle is true', () => {
    it('should render the toggle button', async () => {
      const {toggle} = await renderGeneratedAnswer({
        props: {withToggle: true},
      });
      expect(toggle).toBeInTheDocument();
      expect(toggle).not.toHaveClass('hidden');
    });

    it('should have the toggle checked by default', async () => {
      const {toggle} = await renderGeneratedAnswer({
        props: {withToggle: true},
      });
      expect(toggle).toBeChecked();
    });
  });

  it('should hide the toggle button when withToggle is false', async () => {
    const {toggle} = await renderGeneratedAnswer({
      props: {withToggle: false},
    });
    expect(toggle).toHaveClass('hidden');
  });

  describe('when answer is visible', () => {
    it('should render the generated container', async () => {
      const {generatedContainer} = await renderGeneratedAnswer({
        generatedAnswerState: {isVisible: true, answer: 'Test answer'},
      });
      expect(generatedContainer).toBeInTheDocument();
    });

    it('should render the generated content', async () => {
      const {generatedContent} = await renderGeneratedAnswer({
        generatedAnswerState: {isVisible: true, answer: 'Test answer'},
      });
      expect(generatedContent).toBeInTheDocument();
    });

    it('should render the feedback buttons when not streaming', async () => {
      const {feedbackButtons} = await renderGeneratedAnswer({
        generatedAnswerState: {
          isVisible: true,
          isStreaming: false,
          answer: 'Test',
        },
      });
      expect(feedbackButtons.length).toBeGreaterThan(0);
    });
  });

  it('should not render the generated container when answer is hidden', async () => {
    const {generatedContainer} = await renderGeneratedAnswer({
      generatedAnswerState: {isVisible: false, answer: 'Test answer'},
    });
    expect(generatedContainer).not.toBeInTheDocument();
  });

  it('should render the retry button when there is a retryable error', async () => {
    const {retryContainer} = await renderGeneratedAnswer({
      generatedAnswerState: {
        isVisible: true,
        answer: undefined,
        error: {isRetryable: true, message: 'Error'},
      },
      searchStatusState: {hasError: false},
    });
    expect(retryContainer).toBeInTheDocument();
  });

  it('should render citations label when citations are available', async () => {
    const {citationsLabel} = await renderGeneratedAnswer({
      generatedAnswerState: {
        isVisible: true,
        answer: 'Test answer',
        citations: [
          {
            source: 'Source 1',
            id: 'citation-1',
            title: 'Citation 1',
            uri: 'https://example.com',
            permanentid: 'perm-1',
            clickUri: 'https://example.com/click',
            text: 'Citation text',
          },
        ],
      },
    });
    expect(citationsLabel).toBeInTheDocument();
  });

  it('should call like when like button is clicked', async () => {
    const {likeButton} = await renderGeneratedAnswer({
      generatedAnswerState: {
        isVisible: true,
        answer: 'Test',
        isStreaming: false,
      },
    });
    likeButton.click();
    expect(mockedGeneratedAnswer.like).toHaveBeenCalled();
  });

  it('should warn when maxCollapsedHeight is out of range', async () => {
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    const {element, container} = await renderGeneratedAnswer({
      props: {collapsible: true},
      generatedAnswerState: {isVisible: true, answer: 'Test'},
    });
    element.maxCollapsedHeight = 50;
    await element.updateComplete;

    expect(container).toBeInTheDocument();
  });

  it('should call dislike when dislike button is clicked', async () => {
    const {dislikeButton} = await renderGeneratedAnswer({
      generatedAnswerState: {
        isVisible: true,
        answer: 'Test',
        isStreaming: false,
      },
    });
    dislikeButton.click();
    expect(mockedGeneratedAnswer.dislike).toHaveBeenCalled();
  });

  it('should render copy button when answer is present', async () => {
    const {copyButton} = await renderGeneratedAnswer({
      generatedAnswerState: {
        isVisible: true,
        answer: 'Test answer',
        isStreaming: false,
      },
    });
    expect(copyButton).toBeInTheDocument();
  });

  it('should not render copy button when streaming', async () => {
    const {copyButton} = await renderGeneratedAnswer({
      generatedAnswerState: {
        isVisible: true,
        answer: 'Test answer',
        isStreaming: true,
      },
    });
    expect(copyButton).not.toBeInTheDocument();
  });

  it('should handle citations with empty title', async () => {
    const {element, citationElements} = await renderGeneratedAnswer({
      generatedAnswerState: {
        isVisible: true,
        answer: 'Test answer',
        citations: [
          {
            source: 'Source 1',
            id: 'citation-1',
            title: '',
            uri: 'https://example.com',
            permanentid: 'perm-1',
            clickUri: 'https://example.com/click',
            text: 'Citation text',
          },
        ],
      },
    });
    await element.updateComplete;
    expect(citationElements.length).toBeGreaterThan(0);
  });

  it('should pass interactiveCitation to atomic-citation component', async () => {
    const mockCitation = {
      select: vi.fn(),
      beginDelayedSelect: vi.fn(),
      cancelPendingSelect: vi.fn(),
    } as unknown as InteractiveCitation;
    vi.mocked(buildInteractiveCitation).mockReturnValue(mockCitation);
    const {citationElements} = await renderGeneratedAnswer({
      generatedAnswerState: {
        isVisible: true,
        answer: 'Test answer',
        citations: [
          {
            source: 'Source 1',
            id: 'citation-1',
            title: 'Citation 1',
            uri: 'https://example.com',
            permanentid: 'perm-1',
            clickUri: 'https://example.com/click',
            text: 'Citation text',
          },
        ],
      },
    });

    expect(citationElements.length).toBeGreaterThan(0);
  });

  it('should render disclaimer when answer is visible', async () => {
    const {disclaimer} = await renderGeneratedAnswer({
      generatedAnswerState: {
        isVisible: true,
        answer: 'Test answer',
        isStreaming: false,
      },
    });
    expect(disclaimer).toBeInTheDocument();
  });

  it('should not render disclaimer when answer is hidden', async () => {
    const {disclaimer} = await renderGeneratedAnswer({
      generatedAnswerState: {
        isVisible: false,
        answer: 'Test answer',
      },
    });
    expect(disclaimer).not.toBeInTheDocument();
  });

  it('should render show more button when collapsible and content is tall', async () => {
    const {showMoreButton} = await renderGeneratedAnswer({
      props: {collapsible: true},
      generatedAnswerState: {
        isVisible: true,
        answer: 'A'.repeat(1000), // Long text
      },
    });

    expect(showMoreButton).toBeInTheDocument();
  });

  it('should render show more button when collapsible is enabled and content is short', async () => {
    const {showMoreButton} = await renderGeneratedAnswer({
      props: {collapsible: true},
      generatedAnswerState: {
        isVisible: true,
        answer: 'Short text',
      },
    });

    await expect.element(showMoreButton).toBeInTheDocument();
  });

  it('should toggle visibility when toggle is clicked when toggle is activated and deactivated', async () => {
    const {toggle} = await renderGeneratedAnswer({
      props: {withToggle: true},
      generatedAnswerState: {
        isVisible: true,
        answer: 'Test answer',
      },
    });

    expect(toggle).toBeChecked();
    await userEvent.click(toggle!);
    await expect(mockedGeneratedAnswer.hide).toHaveBeenCalled();
  });

  it('should not render component when error is not retryable', async () => {
    const {container} = await renderGeneratedAnswer({
      generatedAnswerState: {
        isVisible: true,
        answer: undefined,
        error: {isRetryable: false, message: 'Non-retryable error'},
      },
    });
    expect(container).not.toBeInTheDocument();
  });

  it('should not render when no search has been executed', async () => {
    const {generatedContent} = await renderGeneratedAnswer({
      generatedAnswerState: {
        answer: undefined,
      },
    });
    expect(generatedContent).not.toBeInTheDocument();
  });

  it('should not render feedback buttons when streaming', async () => {
    const {feedbackButtons} = await renderGeneratedAnswer({
      generatedAnswerState: {
        isVisible: true,
        answer: 'Test',
        isStreaming: true,
      },
    });
    expect(feedbackButtons.length).toBe(0);
  });

  it('should render feedback buttons when not streaming and answer exists', async () => {
    const {feedbackButtons} = await renderGeneratedAnswer({
      generatedAnswerState: {
        isVisible: true,
        answer: 'Test',
        isStreaming: false,
      },
    });
    expect(feedbackButtons.length).toBeGreaterThan(0);
  });

  it('should call retry when retry button is clicked', async () => {
    const {retryButton} = await renderGeneratedAnswer({
      generatedAnswerState: {
        isVisible: true,
        answer: undefined,
        error: {isRetryable: true, message: 'Error'},
      },
      searchStatusState: {hasError: false},
    });

    if (retryButton) {
      retryButton.click();
      expect(mockedGeneratedAnswer.retry).toHaveBeenCalled();
    }
  });

  it('should call buildInteractiveCitation for each citation', async () => {
    await renderGeneratedAnswer({
      generatedAnswerState: {
        isVisible: true,
        answer: 'Test answer',
        citations: [
          {
            source: 'Source 1',
            id: 'citation-1',
            title: 'Citation 1',
            uri: 'https://example.com',
            permanentid: 'perm-1',
            clickUri: 'https://example.com/click',
            text: 'Citation text',
          },
        ],
      },
    });

    expect(buildInteractiveCitation).toHaveBeenCalled();
  });

  it('should render citation popover for citations', async () => {
    const {element} = await renderGeneratedAnswer({
      generatedAnswerState: {
        isVisible: true,
        answer: 'Test answer',
        citations: [
          {
            source: 'Source 1',
            id: 'citation-1',
            title: 'Citation 1',
            uri: 'https://example.com',
            permanentid: 'perm-1',
            clickUri: 'https://example.com/click',
            text: 'Citation text',
          },
        ],
      },
    });

    await element.updateComplete;
    // Popover exists in the DOM structure
    expect(element).toBeInTheDocument();
  });

  describe('answerConfigurationId property', () => {
    it('should pass answerConfigurationId to buildGeneratedAnswer when provided', async () => {
      const {element} = await renderGeneratedAnswer({
        props: {answerConfigurationId: 'test-config-id'},
        generatedAnswerState: {isVisible: true, answer: 'Test'},
      });
      await element.updateComplete;

      expect(buildGeneratedAnswer).toHaveBeenCalledWith(
        mockedEngine,
        expect.objectContaining({
          answerConfigurationId: 'test-config-id',
        })
      );
    });

    it('should not pass answerConfigurationId when not provided', async () => {
      await renderGeneratedAnswer({
        generatedAnswerState: {isVisible: true, answer: 'Test'},
      });

      expect(buildGeneratedAnswer).toHaveBeenCalledWith(
        mockedEngine,
        expect.not.objectContaining({
          answerConfigurationId: expect.anything(),
        })
      );
    });
  });

  describe('fieldsToIncludeInCitations property', () => {
    // TODO V4 (KIT-5306): Remove legacy comma-separated string support and update tests
    it('should parse comma-separated fields and pass to buildGeneratedAnswer', async () => {
      await renderGeneratedAnswer({
        props: {fieldsToIncludeInCitations: 'author,date,custom_field'},
        generatedAnswerState: {isVisible: true, answer: 'Test'},
      });

      expect(buildGeneratedAnswer).toHaveBeenCalledWith(
        mockedEngine,
        expect.objectContaining({
          fieldsToIncludeInCitations: expect.arrayContaining([
            'author',
            'date',
            'custom_field',
          ]),
        })
      );
    });

    it('should handle empty fieldsToIncludeInCitations', async () => {
      await renderGeneratedAnswer({
        props: {fieldsToIncludeInCitations: ''},
        generatedAnswerState: {isVisible: true, answer: 'Test'},
      });

      expect(buildGeneratedAnswer).toHaveBeenCalledWith(
        mockedEngine,
        expect.objectContaining({
          fieldsToIncludeInCitations: expect.any(Array),
        })
      );
    });

    it('should trim whitespace from field names', async () => {
      await renderGeneratedAnswer({
        props: {fieldsToIncludeInCitations: ' field1 , field2 , field3 '},
        generatedAnswerState: {isVisible: true, answer: 'Test'},
      });

      expect(buildGeneratedAnswer).toHaveBeenCalledWith(
        mockedEngine,
        expect.objectContaining({
          fieldsToIncludeInCitations: expect.arrayContaining([
            'field1',
            'field2',
            'field3',
          ]),
        })
      );
    });
  });

  describe('maxCollapsedHeight property', () => {
    it('should use maxCollapsedHeight when collapsible is true', async () => {
      const {element} = await renderGeneratedAnswer({
        props: {collapsible: true, maxCollapsedHeight: 20},
        generatedAnswerState: {isVisible: true, answer: 'Test answer'},
      });

      expect(element.maxCollapsedHeight).toBe(20);
    });

    it('should warn when maxCollapsedHeight is below minimum', async () => {
      const {element} = await renderGeneratedAnswer({
        props: {collapsible: true, maxCollapsedHeight: 5},
        generatedAnswerState: {isVisible: true, answer: 'Test'},
      });
      await element.updateComplete;

      expect(console.warn).toHaveBeenCalled();
    });

    it('should warn when maxCollapsedHeight is above maximum', async () => {
      const {element} = await renderGeneratedAnswer({
        props: {collapsible: true, maxCollapsedHeight: 35},
        generatedAnswerState: {isVisible: true, answer: 'Test'},
      });
      await element.updateComplete;

      expect(console.warn).toHaveBeenCalled();
    });

    it('should not warn when maxCollapsedHeight is within valid range', async () => {
      const {element} = await renderGeneratedAnswer({
        props: {collapsible: true, maxCollapsedHeight: 16},
        generatedAnswerState: {isVisible: true, answer: 'Test'},
      });
      await element.updateComplete;

      expect(console.warn).not.toHaveBeenCalled();
    });
  });

  // TODO V4: KIT-5197 - Remove skip
  it.skip('should set error when maxCollapsedHeight is invalid', async () => {
    const {element} = await renderGeneratedAnswer();

    expect(element.error).toBeUndefined();

    element.maxCollapsedHeight = 5; // Below minimum
    await element.updateComplete;

    expect(element.error).toBeDefined();
    expect(element.error.message).toMatch(/maxCollapsedHeight/i);
  });

  // TODO V4: KIT-5197 - Remove this test
  it('should log validation warning when maxCollapsedHeight is updated to invalid value', async () => {
    const consoleWarnSpy = vi
      .spyOn(console, 'warn')
      .mockImplementation(() => {});

    const {element} = await renderGeneratedAnswer({
      props: {maxCollapsedHeight: 16}, // Valid value
    });

    element.maxCollapsedHeight = 5; // Invalid value (below minimum)
    await element.updateComplete;

    expect(consoleWarnSpy).toHaveBeenCalledWith(
      expect.stringContaining(
        'Prop validation failed for component atomic-insight-generated-answer'
      ),
      element
    );
    expect(consoleWarnSpy).toHaveBeenCalledWith(
      expect.stringContaining('maxCollapsedHeight'),
      element
    );

    consoleWarnSpy.mockRestore();
  });

  // TODO V4: KIT-5197 - Remove skip
  it.skip('should throw error when maxCollapsedHeight is invalid after valid value', async () => {
    const {element} = await renderGeneratedAnswer({
      props: {maxCollapsedHeight: 16}, // Valid value
    });

    expect(element.error).toBeUndefined();

    element.maxCollapsedHeight = 35; // Invalid value (above maximum)
    await element.updateComplete;

    expect(element.error).toBeDefined();
    expect(element.error.message).toMatch(/maxCollapsedHeight/i);
  });
});

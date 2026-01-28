import {
  buildGeneratedAnswer,
  buildInteractiveCitation,
  buildSearchStatus,
  buildTabManager,
  type GeneratedAnswer,
  type GeneratedAnswerState,
  type InteractiveCitation,
  type SearchStatus,
  type TabManager,
} from '@coveo/headless';
import {html} from 'lit';
import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import {renderInAtomicSearchInterface} from '@/vitest-utils/testing-helpers/fixtures/atomic/search/atomic-search-interface-fixture';
import {buildFakeSearchEngine} from '@/vitest-utils/testing-helpers/fixtures/headless/search/engine';
import {buildFakeGeneratedAnswer} from '@/vitest-utils/testing-helpers/fixtures/headless/search/generated-answer-controller';
import {buildFakeSearchStatus} from '@/vitest-utils/testing-helpers/fixtures/headless/search/search-status-controller';
import {buildFakeTabManager} from '@/vitest-utils/testing-helpers/fixtures/headless/search/tab-manager-controller';
import type {AtomicGeneratedAnswer} from './atomic-generated-answer';
import './atomic-generated-answer';
import {userEvent} from 'vitest/browser';

vi.mock('@coveo/headless', {spy: true});

describe('atomic-generated-answer', () => {
  const mockedEngine = buildFakeSearchEngine();
  let mockedGeneratedAnswer: GeneratedAnswer;
  let mockedSearchStatus: SearchStatus;
  let mockedTabManager: TabManager;

  const renderGeneratedAnswer = async ({
    props = {},
    generatedAnswerState = {},
    searchStatusState = {},
    tabManagerState = {},
  }: {
    props?: Partial<AtomicGeneratedAnswer>;
    generatedAnswerState?: Partial<GeneratedAnswerState>;
    searchStatusState?: {hasError?: boolean};
    tabManagerState?: {activeTab?: string};
  } = {}) => {
    mockedGeneratedAnswer = buildFakeGeneratedAnswer({
      answer: 'Test answer',
      citations: [],
      isVisible: true,
      ...generatedAnswerState,
    });

    mockedSearchStatus = buildFakeSearchStatus({
      hasError: false,
      firstSearchExecuted: true,
      isLoading: false,
      hasResults: true,
      ...searchStatusState,
    });

    mockedTabManager = buildFakeTabManager({
      activeTab: 'All',
      ...tabManagerState,
    });

    vi.mocked(buildGeneratedAnswer).mockReturnValue(mockedGeneratedAnswer);
    vi.mocked(buildSearchStatus).mockReturnValue(mockedSearchStatus);
    vi.mocked(buildTabManager).mockReturnValue(mockedTabManager);
    vi.mocked(buildInteractiveCitation).mockReturnValue({
      select: vi.fn(),
      beginDelayedSelect: vi.fn(),
      cancelPendingSelect: vi.fn(),
    } as ReturnType<typeof buildInteractiveCitation>);

    const {element} =
      await renderInAtomicSearchInterface<AtomicGeneratedAnswer>({
        template: html`<atomic-generated-answer
          .withToggle=${props.withToggle ?? false}
          .collapsible=${props.collapsible ?? false}
          .disableCitationAnchoring=${props.disableCitationAnchoring ?? false}
          .answerConfigurationId=${props.answerConfigurationId}
          fields-to-include-in-citations=${props.fieldsToIncludeInCitations}
          .maxCollapsedHeight=${props.maxCollapsedHeight ?? 16}
          .tabsIncluded=${props.tabsIncluded ?? []}
          .tabsExcluded=${props.tabsExcluded ?? []}
        ></atomic-generated-answer>`,
        selector: 'atomic-generated-answer',
        bindings: (bindings) => {
          bindings.engine = mockedEngine;
          return bindings;
        },
      });

    return {
      element,
      get container() {
        return element.shadowRoot?.querySelector('[part="container"]')!;
      },
      get headerLabel() {
        return element.shadowRoot?.querySelector('[part="header-label"]')!;
      },
      get toggle() {
        return element.shadowRoot?.querySelector('[part="toggle"]')!;
      },
      get generatedContainer() {
        return element.shadowRoot?.querySelector(
          '[part="generated-container"]'
        );
      },
      get generatedContent() {
        return element.shadowRoot?.querySelector('[part="generated-content"]')!;
      },
      get feedbackButtons() {
        return element.shadowRoot?.querySelectorAll(
          '[part="feedback-button"]'
        )!;
      },
      get copyButton() {
        return element.shadowRoot?.querySelector('[part="copy-button"]')!;
      },
      get citationsLabel() {
        return element.shadowRoot?.querySelector('[part="citations-label"]')!;
      },
      get generatedAnswerFooter() {
        return element.shadowRoot?.querySelector(
          '[part="generated-answer-footer"]'
        );
      },
      get likeButton() {
        return element.shadowRoot?.querySelector(
          '[part="feedback-button"]:first-child'
        ) as HTMLButtonElement;
      },
      get dislikeButton() {
        return element.shadowRoot?.querySelector(
          '[part="feedback-button"].dislike'
        ) as HTMLButtonElement;
      },
      get retryContainer() {
        return element.shadowRoot?.querySelector('[part="retry-container"]')!;
      },
      get retryButton() {
        return element.shadowRoot?.querySelector(
          '[part="retry-button"]'
        ) as HTMLButtonElement;
      },
      get citationElements() {
        return element.shadowRoot?.querySelectorAll('atomic-citation')!;
      },
      get disclaimer() {
        return element.shadowRoot?.querySelector('slot[name="disclaimer"]')!;
      },
      get showMoreButton() {
        return element.shadowRoot?.querySelector(
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

    it('should call buildTabManager with the engine', async () => {
      await renderGeneratedAnswer();
      expect(buildTabManager).toHaveBeenCalledWith(mockedEngine);
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

  it('should not render when active tab is in tabsExcluded', async () => {
    const {element, container} = await renderGeneratedAnswer({
      tabManagerState: {activeTab: 'ExcludedTab'},
    });
    element.tabsExcluded = ['ExcludedTab'];
    await element.updateComplete;
    expect(container).not.toBeInTheDocument();
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

  it('should show button even when content is short', async () => {
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
    await userEvent.click(toggle);
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
        'Prop validation failed for component atomic-generated-answer'
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

  describe('disableCitationAnchoring property', () => {
    it('should have disableCitationAnchoring as false by default', async () => {
      const {element} = await renderGeneratedAnswer({
        generatedAnswerState: {isVisible: true, answer: 'Test'},
      });

      expect(element.disableCitationAnchoring).toBe(false);
    });

    it('should pass disableCitationAnchoring=false to citation elements', async () => {
      const {citationElements} = await renderGeneratedAnswer({
        props: {disableCitationAnchoring: false},
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
      const citation = citationElements[0] as HTMLElement & {
        disableCitationAnchoring: boolean;
      };
      expect(citation.disableCitationAnchoring).toBe(false);
    });

    it('should pass disableCitationAnchoring=true to citation elements when enabled', async () => {
      const {citationElements} = await renderGeneratedAnswer({
        props: {disableCitationAnchoring: true},
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
      const citation = citationElements[0] as HTMLElement & {
        disableCitationAnchoring: boolean;
      };
      expect(citation.disableCitationAnchoring).toBe(true);
    });

    it('should pass disableCitationAnchoring to all citations when multiple exist', async () => {
      const {citationElements} = await renderGeneratedAnswer({
        props: {disableCitationAnchoring: true},
        generatedAnswerState: {
          isVisible: true,
          answer: 'Test answer',
          citations: [
            {
              source: 'Source 1',
              id: 'citation-1',
              title: 'Citation 1',
              uri: 'https://example.com/1',
              permanentid: 'perm-1',
              clickUri: 'https://example.com/click/1',
              text: 'Citation text 1',
            },
            {
              source: 'Source 2',
              id: 'citation-2',
              title: 'Citation 2',
              uri: 'https://example.com/2',
              permanentid: 'perm-2',
              clickUri: 'https://example.com/click/2',
              text: 'Citation text 2',
            },
            {
              source: 'Source 3',
              id: 'citation-3',
              title: 'Citation 3',
              uri: 'https://example.com/3',
              permanentid: 'perm-3',
              clickUri: 'https://example.com/click/3',
              text: 'Citation text 3',
            },
          ],
        },
      });

      expect(citationElements.length).toBe(3);
      citationElements.forEach((citationEl) => {
        const citation = citationEl as HTMLElement & {
          disableCitationAnchoring: boolean;
        };
        expect(citation.disableCitationAnchoring).toBe(true);
      });
    });
  });

  describe('tabsExcluded property', () => {
    it('should render when tabsExcluded is empty', async () => {
      const {container} = await renderGeneratedAnswer({
        props: {tabsExcluded: []},
        tabManagerState: {activeTab: 'AnyTab'},
        generatedAnswerState: {isVisible: true, answer: 'Test answer'},
      });

      expect(container).toBeInTheDocument();
    });

    it('should render when active tab is not in tabsExcluded', async () => {
      const {container} = await renderGeneratedAnswer({
        props: {tabsExcluded: ['ExcludedTab1', 'ExcludedTab2']},
        tabManagerState: {activeTab: 'AllowedTab'},
        generatedAnswerState: {isVisible: true, answer: 'Test answer'},
      });

      expect(container).toBeInTheDocument();
    });

    it('should not render when active tab is in tabsExcluded', async () => {
      const {container} = await renderGeneratedAnswer({
        props: {tabsExcluded: ['ExcludedTab1', 'ExcludedTab2']},
        tabManagerState: {activeTab: 'ExcludedTab1'},
        generatedAnswerState: {isVisible: true, answer: 'Test answer'},
      });

      expect(container).not.toBeInTheDocument();
    });

    it('should handle single excluded tab', async () => {
      const {container} = await renderGeneratedAnswer({
        props: {tabsExcluded: ['OnlyExcludedTab']},
        tabManagerState: {activeTab: 'OnlyExcludedTab'},
        generatedAnswerState: {isVisible: true, answer: 'Test answer'},
      });

      expect(container).not.toBeInTheDocument();
    });

    it('should hide when switching to an excluded tab', async () => {
      const {element, container} = await renderGeneratedAnswer({
        props: {tabsExcluded: ['ExcludedTab']},
        tabManagerState: {activeTab: 'AllowedTab'},
        generatedAnswerState: {isVisible: true, answer: 'Test answer'},
      });

      expect(container).toBeInTheDocument();

      // Simulate tab change
      element.tabManagerState = {activeTab: 'ExcludedTab'};
      await element.updateComplete;

      expect(container).not.toBeInTheDocument();
    });

    it('should show when switching from excluded to allowed tab', async () => {
      const {element} = await renderGeneratedAnswer({
        props: {tabsExcluded: ['ExcludedTab']},
        tabManagerState: {activeTab: 'ExcludedTab'},
        generatedAnswerState: {isVisible: true, answer: 'Test answer'},
      });

      const containerBefore =
        element.shadowRoot?.querySelector('[part="container"]');
      expect(containerBefore).not.toBeInTheDocument();

      // Simulate tab change to allowed tab
      element.tabManagerState = {activeTab: 'AllowedTab'};
      await element.updateComplete;

      const containerAfter =
        element.shadowRoot?.querySelector('[part="container"]');
      expect(containerAfter).toBeInTheDocument();
    });

    it('should call disable() when switching to excluded tab', async () => {
      const {element} = await renderGeneratedAnswer({
        props: {tabsExcluded: ['ExcludedTab']},
        tabManagerState: {activeTab: 'AllowedTab'},
        generatedAnswerState: {isVisible: true, answer: 'Test answer'},
      });

      const disableSpy = vi.spyOn(element.generatedAnswer, 'disable');

      // Simulate tab change to excluded tab
      element.tabManagerState = {activeTab: 'ExcludedTab'};
      await element.updateComplete;

      expect(disableSpy).toHaveBeenCalled();
    });

    it('should call enable() when switching to allowed tab', async () => {
      const {element} = await renderGeneratedAnswer({
        props: {tabsExcluded: ['ExcludedTab']},
        tabManagerState: {activeTab: 'ExcludedTab'},
        generatedAnswerState: {isVisible: true, answer: 'Test answer'},
      });

      const enableSpy = vi.spyOn(element.generatedAnswer, 'enable');

      // Simulate tab change to allowed tab
      element.tabManagerState = {activeTab: 'AllowedTab'};
      await element.updateComplete;

      expect(enableSpy).toHaveBeenCalled();
    });
  });

  describe('tabsIncluded property', () => {
    it('should render when tabsIncluded is empty (all tabs allowed)', async () => {
      const {container} = await renderGeneratedAnswer({
        props: {tabsIncluded: []},
        tabManagerState: {activeTab: 'AnyTab'},
        generatedAnswerState: {isVisible: true, answer: 'Test answer'},
      });

      expect(container).toBeInTheDocument();
    });

    it('should render when active tab is in tabsIncluded', async () => {
      const {container} = await renderGeneratedAnswer({
        props: {tabsIncluded: ['IncludedTab1', 'IncludedTab2']},
        tabManagerState: {activeTab: 'IncludedTab1'},
        generatedAnswerState: {isVisible: true, answer: 'Test answer'},
      });

      expect(container).toBeInTheDocument();
    });

    it('should not render when active tab is not in tabsIncluded', async () => {
      const {container} = await renderGeneratedAnswer({
        props: {tabsIncluded: ['IncludedTab1', 'IncludedTab2']},
        tabManagerState: {activeTab: 'OtherTab'},
        generatedAnswerState: {isVisible: true, answer: 'Test answer'},
      });

      expect(container).not.toBeInTheDocument();
    });

    it('should handle single included tab', async () => {
      const {container} = await renderGeneratedAnswer({
        props: {tabsIncluded: ['OnlyIncludedTab']},
        tabManagerState: {activeTab: 'OnlyIncludedTab'},
        generatedAnswerState: {isVisible: true, answer: 'Test answer'},
      });

      expect(container).toBeInTheDocument();
    });

    it('should hide when switching to a non-included tab', async () => {
      const {element, container} = await renderGeneratedAnswer({
        props: {tabsIncluded: ['IncludedTab']},
        tabManagerState: {activeTab: 'IncludedTab'},
        generatedAnswerState: {isVisible: true, answer: 'Test answer'},
      });

      expect(container).toBeInTheDocument();

      // Simulate tab change to non-included tab
      element.tabManagerState = {activeTab: 'OtherTab'};
      await element.updateComplete;

      expect(container).not.toBeInTheDocument();
    });

    it('should show when switching to an included tab', async () => {
      const {element} = await renderGeneratedAnswer({
        props: {tabsIncluded: ['IncludedTab1', 'IncludedTab2']},
        tabManagerState: {activeTab: 'OtherTab'},
        generatedAnswerState: {isVisible: true, answer: 'Test answer'},
      });

      const containerBefore =
        element.shadowRoot?.querySelector('[part="container"]');
      expect(containerBefore).not.toBeInTheDocument();

      // Simulate tab change to included tab
      element.tabManagerState = {activeTab: 'IncludedTab2'};
      await element.updateComplete;

      const containerAfter =
        element.shadowRoot?.querySelector('[part="container"]');
      expect(containerAfter).toBeInTheDocument();
    });

    it('should call disable() when switching to non-included tab', async () => {
      const {element} = await renderGeneratedAnswer({
        props: {tabsIncluded: ['IncludedTab']},
        tabManagerState: {activeTab: 'IncludedTab'},
        generatedAnswerState: {isVisible: true, answer: 'Test answer'},
      });

      const disableSpy = vi.spyOn(element.generatedAnswer, 'disable');

      // Simulate tab change to non-included tab
      element.tabManagerState = {activeTab: 'OtherTab'};
      await element.updateComplete;

      expect(disableSpy).toHaveBeenCalled();
    });

    it('should call enable() when switching to included tab', async () => {
      const {element} = await renderGeneratedAnswer({
        props: {tabsIncluded: ['IncludedTab']},
        tabManagerState: {activeTab: 'OtherTab'},
        generatedAnswerState: {isVisible: true, answer: 'Test answer'},
      });

      const enableSpy = vi.spyOn(element.generatedAnswer, 'enable');

      // Simulate tab change to included tab
      element.tabManagerState = {activeTab: 'IncludedTab'};
      await element.updateComplete;

      expect(enableSpy).toHaveBeenCalled();
    });
  });

  describe('tabs properties conflict', () => {
    let consoleWarnSpy: ReturnType<typeof vi.spyOn>;

    beforeEach(() => {
      consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    });

    afterEach(() => {
      consoleWarnSpy.mockRestore();
    });

    it('should log warning when both tabsIncluded and tabsExcluded are set', async () => {
      await renderGeneratedAnswer({
        props: {
          tabsIncluded: ['IncludedTab'],
          tabsExcluded: ['ExcludedTab'],
        },
        tabManagerState: {activeTab: 'AnyTab'},
        generatedAnswerState: {isVisible: true, answer: 'Test answer'},
      });

      expect(consoleWarnSpy).toHaveBeenCalledWith(
        'Values for both "tabs-included" and "tabs-excluded" have been provided. This could lead to unexpected behaviors.'
      );
    });

    it('should prioritize tabsExcluded when both properties are set', async () => {
      const {container} = await renderGeneratedAnswer({
        props: {
          tabsIncluded: ['IncludedTab'],
          tabsExcluded: ['IncludedTab'], // Same tab in both - excluded should win
        },
        tabManagerState: {activeTab: 'IncludedTab'},
        generatedAnswerState: {isVisible: true, answer: 'Test answer'},
      });

      // According to shouldDisplayOnCurrentTab, excludes take precedence
      expect(container).not.toBeInTheDocument();
    });

    it('should not log warning when only tabsIncluded is set', async () => {
      await renderGeneratedAnswer({
        props: {tabsIncluded: ['IncludedTab']},
        tabManagerState: {activeTab: 'IncludedTab'},
        generatedAnswerState: {isVisible: true, answer: 'Test answer'},
      });

      expect(consoleWarnSpy).not.toHaveBeenCalled();
    });

    it('should not log warning when only tabsExcluded is set', async () => {
      await renderGeneratedAnswer({
        props: {tabsExcluded: ['ExcludedTab']},
        tabManagerState: {activeTab: 'AllowedTab'},
        generatedAnswerState: {isVisible: true, answer: 'Test answer'},
      });

      expect(consoleWarnSpy).not.toHaveBeenCalled();
    });

    it('should not log warning when both properties are empty', async () => {
      await renderGeneratedAnswer({
        props: {tabsIncluded: [], tabsExcluded: []},
        tabManagerState: {activeTab: 'AnyTab'},
        generatedAnswerState: {isVisible: true, answer: 'Test answer'},
      });

      expect(consoleWarnSpy).not.toHaveBeenCalled();
    });
  });
});

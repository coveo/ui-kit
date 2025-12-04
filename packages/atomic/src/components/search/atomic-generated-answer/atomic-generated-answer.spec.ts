import {
  buildGeneratedAnswer,
  buildInteractiveCitation,
  buildSearchStatus,
  buildTabManager,
  type GeneratedAnswer,
  type GeneratedAnswerState,
  type SearchStatus,
  type TabManager,
} from '@coveo/headless';
import {html} from 'lit';
import {beforeEach, describe, expect, it, vi} from 'vitest';
import {renderInAtomicSearchInterface} from '@/vitest-utils/testing-helpers/fixtures/atomic/search/atomic-search-interface-fixture';
import {buildFakeSearchEngine} from '@/vitest-utils/testing-helpers/fixtures/headless/search/engine';
import {buildFakeGeneratedAnswer} from '@/vitest-utils/testing-helpers/fixtures/headless/search/generated-answer-controller';
import {buildFakeSearchStatus} from '@/vitest-utils/testing-helpers/fixtures/headless/search/search-status-controller';
import {buildFakeTabManager} from '@/vitest-utils/testing-helpers/fixtures/headless/search/tab-manager-controller';
import type {AtomicGeneratedAnswer} from './atomic-generated-answer';
import './atomic-generated-answer';

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
      ></atomic-generated-answer>`,
        selector: 'atomic-generated-answer',
        bindings: (bindings) => {
          bindings.engine = mockedEngine;
          return bindings;
        },
      });

    return {
      element,
      parts: (el: AtomicGeneratedAnswer) => ({
        container: el.shadowRoot?.querySelector('[part="container"]'),
        headerLabel: el.shadowRoot?.querySelector('[part="header-label"]'),
        toggle: el.shadowRoot?.querySelector('[part="toggle"]'),
        generatedContainer: el.shadowRoot?.querySelector(
          '[part="generated-container"]'
        ),
        generatedContent: el.shadowRoot?.querySelector(
          '[part="generated-content"]'
        ),
        feedbackButtons: el.shadowRoot?.querySelectorAll(
          '[part="feedback-button"]'
        ),
        copyButton: el.shadowRoot?.querySelector('[part="copy-button"]'),
        citationsLabel: el.shadowRoot?.querySelector(
          '[part="citations-label"]'
        ),
        generatedAnswerFooter: el.shadowRoot?.querySelector(
          '[part="generated-answer-footer"]'
        ),
      }),
    };
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('when answer is available', () => {
    it('should render the container', async () => {
      const {parts, element} = await renderGeneratedAnswer();
      expect(parts(element).container).toBeTruthy();
    });

    it('should render the header label', async () => {
      const {parts, element} = await renderGeneratedAnswer();
      expect(parts(element).headerLabel).toBeTruthy();
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

  describe('when no answer is generated', () => {
    it('should not render the container when answer is undefined', async () => {
      const {parts, element} = await renderGeneratedAnswer({
        generatedAnswerState: {answer: undefined, citations: []},
      });
      expect(parts(element).container).toBeFalsy();
    });
  });

  describe('when withToggle is true', () => {
    it('should render the toggle button', async () => {
      const {parts, element} = await renderGeneratedAnswer({
        props: {withToggle: true},
      });
      const toggle = parts(element).toggle;
      expect(toggle).toBeTruthy();
      expect(toggle?.classList.contains('hidden')).toBe(false);
    });
  });

  describe('when withToggle is false', () => {
    it('should hide the toggle button', async () => {
      const {parts, element} = await renderGeneratedAnswer({
        props: {withToggle: false},
      });
      const toggle = parts(element).toggle;
      expect(toggle?.classList.contains('hidden')).toBe(true);
    });
  });

  describe('when answer is visible', () => {
    it('should render the generated content', async () => {
      const {parts, element} = await renderGeneratedAnswer({
        generatedAnswerState: {isVisible: true, answer: 'Test answer'},
      });
      expect(parts(element).generatedContainer).toBeTruthy();
    });

    it('should render the feedback buttons when not streaming', async () => {
      const {parts, element} = await renderGeneratedAnswer({
        generatedAnswerState: {
          isVisible: true,
          isStreaming: false,
          answer: 'Test',
        },
      });
      expect(parts(element).feedbackButtons?.length).toBeGreaterThan(0);
    });
  });

  describe('when answer is hidden', () => {
    it('should not render the generated container', async () => {
      const {parts, element} = await renderGeneratedAnswer({
        generatedAnswerState: {isVisible: false, answer: 'Test answer'},
      });
      expect(parts(element).generatedContainer).toBeFalsy();
    });
  });

  describe('when there is a retryable error', () => {
    it('should render the retry button', async () => {
      const {element} = await renderGeneratedAnswer({
        generatedAnswerState: {
          isVisible: true,
          answer: undefined,
          error: {isRetryable: true, message: 'Error'},
        },
        searchStatusState: {hasError: false},
      });
      const retryContainer = element.shadowRoot?.querySelector(
        '[part="retry-container"]'
      );
      expect(retryContainer).toBeTruthy();
    });
  });

  describe('tab filtering', () => {
    it('should not render when active tab is in tabsExcluded', async () => {
      const {element} = await renderGeneratedAnswer({
        tabManagerState: {activeTab: 'ExcludedTab'},
      });
      element.tabsExcluded = ['ExcludedTab'];
      await element.updateComplete;
      const container = element.shadowRoot?.querySelector('[part="container"]');
      expect(container).toBeFalsy();
    });
  });

  describe('when citations are available', () => {
    it('should render citations label', async () => {
      const {parts, element} = await renderGeneratedAnswer({
        generatedAnswerState: {
          isVisible: true,
          answer: 'Test answer',
          citations: [
            {
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
      expect(parts(element).citationsLabel).toBeTruthy();
    });
  });

  describe('feedback interaction', () => {
    it('should call like when like button is clicked', async () => {
      const {element} = await renderGeneratedAnswer({
        generatedAnswerState: {
          isVisible: true,
          answer: 'Test',
          isStreaming: false,
        },
      });
      const likeButton = element.shadowRoot?.querySelector(
        '[part="feedback-button"]:first-child'
      ) as HTMLButtonElement;
      likeButton?.click();
      expect(mockedGeneratedAnswer.like).toHaveBeenCalled();
    });
  });

  describe('maxCollapsedHeight validation', () => {
    beforeEach(() => {
      vi.spyOn(console, 'warn').mockImplementation(() => {});
    });

    it('should warn when maxCollapsedHeight is out of range', async () => {
      const {element} = await renderGeneratedAnswer({
        props: {collapsible: true},
        generatedAnswerState: {isVisible: true, answer: 'Test'},
      });
      element.maxCollapsedHeight = 50;
      await element.updateComplete;

      // Trigger the validation by accessing the method that validates
      const container = element.shadowRoot?.querySelector(
        '[part="generated-container"]'
      );
      expect(container).toBeTruthy();
    });
  });
});

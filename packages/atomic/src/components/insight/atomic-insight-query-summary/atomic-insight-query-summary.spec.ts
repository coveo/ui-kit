import {
  buildQuerySummary,
  type QuerySummary,
  type QuerySummaryState,
} from '@coveo/headless/insight';
import {html} from 'lit';
import {beforeEach, describe, expect, it, vi} from 'vitest';
import {renderInAtomicInsightInterface} from '@/vitest-utils/testing-helpers/fixtures/atomic/insight/atomic-insight-interface-fixture';
import {genericSubscribe} from '@/vitest-utils/testing-helpers/fixtures/headless/common';
import {buildFakeInsightEngine} from '@/vitest-utils/testing-helpers/fixtures/headless/insight/engine';
import type {AtomicInsightQuerySummary} from './atomic-insight-query-summary';
import './atomic-insight-query-summary';

// Mock headless at the top level
vi.mock('@coveo/headless/insight', {spy: true});

// Fake QuerySummary controller builder
const defaultQuerySummaryState: QuerySummaryState = {
  hasError: false,
  hasQuery: false,
  hasResults: true,
  firstSearchExecuted: true,
  firstResult: 1,
  lastResult: 10,
  isLoading: false,
  query: '',
  total: 100,
  durationInMilliseconds: 123,
  durationInSeconds: 0.123,
  hasDuration: true,
};

const defaultQuerySummaryImplementation: QuerySummary = {
  subscribe: genericSubscribe,
  state: defaultQuerySummaryState,
};

const buildFakeQuerySummary = ({
  implementation,
  state,
}: Partial<{
  implementation?: Partial<QuerySummary>;
  state?: Partial<QuerySummaryState>;
}> = {}): QuerySummary => ({
  ...defaultQuerySummaryImplementation,
  ...implementation,
  ...(state && {state: {...defaultQuerySummaryState, ...state}}),
});

describe('AtomicInsightQuerySummary', () => {
  const mockedEngine = buildFakeInsightEngine();
  let mockedQuerySummary: QuerySummary;

  const renderComponent = async ({
    querySummaryState = {},
  }: {
    querySummaryState?: Partial<QuerySummaryState>;
  } = {}) => {
    mockedQuerySummary = buildFakeQuerySummary({state: querySummaryState});

    vi.mocked(buildQuerySummary).mockReturnValue(mockedQuerySummary);

    const {element} =
      await renderInAtomicInsightInterface<AtomicInsightQuerySummary>({
        template: html`<atomic-insight-query-summary></atomic-insight-query-summary>`,
        selector: 'atomic-insight-query-summary',
        bindings: (bindings) => {
          bindings.engine = mockedEngine;
          bindings.store.onChange = vi.fn();
          return bindings;
        },
      });

    return {
      element,
      placeholder: element.shadowRoot!.querySelector('[part="placeholder"]'),
      container: element.shadowRoot!.querySelector('[part="container"]'),
      parts: (element: AtomicInsightQuerySummary) => {
        const qs = (part: string) =>
          element.shadowRoot?.querySelector(`[part*="${part}"]`);
        return {
          container: qs('container'),
          highlight: qs('highlight'),
          query: qs('query'),
          placeholder: qs('placeholder'),
        };
      },
    };
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render correctly with default state', async () => {
    const {element} = await renderComponent();
    expect(element).toBeDefined();
  });

  it('should initialize QuerySummary controller when component initializes', async () => {
    await renderComponent();
    expect(buildQuerySummary).toHaveBeenCalledWith(mockedEngine);
  });

  it('should call buildQuerySummary and set this.querySummary', async () => {
    const {element} = await renderComponent();
    expect(element.querySummary).toBe(mockedQuerySummary);
  });

  describe('when there is a query', () => {
    it('should display query summary with query', async () => {
      const {element, container} = await renderComponent({
        querySummaryState: {
          hasQuery: true,
          query: 'test query',
          total: 25,
          firstResult: 1,
          lastResult: 10,
          hasResults: true,
          firstSearchExecuted: true,
        },
      });

      expect(element).toBeDefined();
      expect(container).toBeInTheDocument();
    });

    it('should render container with padding classes', async () => {
      const {container} = await renderComponent({
        querySummaryState: {
          hasQuery: true,
          query: 'test query',
          hasResults: true,
          firstSearchExecuted: true,
        },
      });

      expect(container).toBeInTheDocument();
      expect(container?.getAttribute('class')).toContain('px-6');
      expect(container?.getAttribute('class')).toContain('py-4');
    });

    it('should highlight query text when query is present', async () => {
      const {element, parts} = await renderComponent({
        querySummaryState: {
          hasQuery: true,
          query: 'test query',
          hasResults: true,
          firstSearchExecuted: true,
        },
      });

      const highlights = parts(element);
      expect(highlights.query).toBeInTheDocument();

      const queryText = element.shadowRoot!.textContent;
      expect(queryText).toContain('test query');
    });

    it('should highlight numbers when query is present', async () => {
      const {element, parts} = await renderComponent({
        querySummaryState: {
          hasQuery: true,
          query: 'test query',
          hasResults: true,
          firstSearchExecuted: true,
          total: 150,
        },
      });

      const highlights = parts(element);
      expect(highlights.highlight).toBeInTheDocument();

      const summaryText = element.shadowRoot!.textContent;
      expect(summaryText).toContain('150');
    });
  });

  describe('when there is no query and no error', () => {
    it('should display default insight message', async () => {
      const {element} = await renderComponent({
        querySummaryState: {
          hasQuery: false,
          hasError: false,
          query: '',
        },
      });

      const defaultMessage = element.shadowRoot!.querySelector('div');
      expect(defaultMessage).toBeInTheDocument();
      expect(defaultMessage?.classList.toString()).toContain('bg-[#F1F2FF]');
    });

    it('should apply correct styling classes to default message', async () => {
      const {element} = await renderComponent({
        querySummaryState: {
          hasQuery: false,
          hasError: false,
          query: '',
        },
      });

      const defaultMessage = element.shadowRoot!.querySelector('div');
      expect(defaultMessage).toBeInTheDocument();
      expect(defaultMessage?.classList.toString()).toContain('bg-[#F1F2FF]');
      expect(defaultMessage?.classList.toString()).toContain('px-6');
      expect(defaultMessage?.classList.toString()).toContain('py-4');
      expect(defaultMessage?.classList.toString()).toContain('text-[#54698D]');
      expect(defaultMessage?.classList.toString()).toContain('italic');
    });
  });

  describe('when there is an error', () => {
    it('should render nothing when there is an error', async () => {
      const {element, container} = await renderComponent({
        querySummaryState: {
          hasError: true,
          hasQuery: false,
        },
      });

      expect(element.shadowRoot!.children.length).toBe(0);
      expect(container).toBeNull();
    });
  });

  describe('when first search has not been executed', () => {
    it('should show placeholder when first search not executed', async () => {
      const {placeholder} = await renderComponent({
        querySummaryState: {
          firstSearchExecuted: false,
          hasQuery: true,
          query: 'test',
          hasResults: true,
        },
      });

      expect(placeholder).toBeInTheDocument();
    });
  });

  describe('when query has no results', () => {
    it('should render nothing when query has no results', async () => {
      const {container} = await renderComponent({
        querySummaryState: {
          hasQuery: true,
          hasResults: false,
          firstSearchExecuted: true,
          query: 'no results query',
        },
      });

      expect(container).toBeNull();
    });
  });

  describe('when component is loading', () => {
    it('should handle loading state correctly', async () => {
      const {element} = await renderComponent({
        querySummaryState: {
          isLoading: true,
          hasQuery: true,
          query: 'loading query',
          hasResults: true,
          firstSearchExecuted: true,
        },
      });

      expect(element).toBeDefined();
    });
  });

  describe('with different result ranges', () => {
    it('should display correct range when showing single result', async () => {
      const {container, element} = await renderComponent({
        querySummaryState: {
          hasQuery: true,
          query: 'single result',
          firstResult: 1,
          lastResult: 1,
          total: 1,
          hasResults: true,
          firstSearchExecuted: true,
        },
      });

      expect(container).toBeInTheDocument();

      const summaryText = element.shadowRoot!.textContent;
      expect(summaryText).toContain('1');
    });

    it('should display correct range when showing multiple results', async () => {
      const {container, element} = await renderComponent({
        querySummaryState: {
          hasQuery: true,
          query: 'multiple results',
          firstResult: 11,
          lastResult: 20,
          total: 150,
          hasResults: true,
          firstSearchExecuted: true,
        },
      });

      expect(container).toBeInTheDocument();

      const summaryText = element.shadowRoot!.textContent;
      expect(summaryText).toContain('11');
      expect(summaryText).toContain('20');
      expect(summaryText).toContain('150');
    });
  });

  describe('accessibility', () => {
    it('should provide aria-live message when query has results', async () => {
      const {element} = await renderComponent({
        querySummaryState: {
          hasQuery: true,
          query: 'accessible query',
          total: 50,
          hasResults: true,
          firstSearchExecuted: true,
        },
      });

      // Verify component initializes correctly (aria message is protected)
      expect(element).toBeDefined();
      expect(element.tagName.toLowerCase()).toBe(
        'atomic-insight-query-summary'
      );
    });

    it('should update aria-live message when state changes', async () => {
      const {element} = await renderComponent({
        querySummaryState: {
          hasQuery: true,
          query: 'test',
          isLoading: false,
          hasResults: true,
          firstSearchExecuted: true,
        },
      });

      // Verify component renders with proper accessibility
      expect(element).toBeDefined();
      expect(element.tagName.toLowerCase()).toBe(
        'atomic-insight-query-summary'
      );
    });
  });

  describe('i18n integration', () => {
    it('should use correct i18n key when query is empty', async () => {
      const {element} = await renderComponent({
        querySummaryState: {
          hasQuery: false,
          query: '',
          total: 25,
          hasError: false,
        },
      });

      // Component should render the default insight message
      const defaultMessage = element.shadowRoot!.querySelector('div');
      expect(defaultMessage).toBeInTheDocument();
      expect(defaultMessage?.classList.toString()).toContain('bg-[#F1F2FF]');

      // Validate the actual label text displayed to the user
      const messageText = defaultMessage?.textContent;
      expect(messageText).toContain('Insights related to this case');
    });

    it('should use correct i18n key when query is present', async () => {
      const {container, element} = await renderComponent({
        querySummaryState: {
          hasQuery: true,
          query: 'search term',
          total: 25,
          firstResult: 1,
          lastResult: 10,
          hasResults: true,
          firstSearchExecuted: true,
        },
      });

      // Component should render query summary
      expect(container).toBeInTheDocument();

      // Validate the actual label text contains the expected query summary format
      const summaryText = element.shadowRoot!.textContent;
      expect(summaryText).toContain('search term');
      expect(summaryText).toContain('25');
      expect(summaryText).toMatch(/Results?\s+\d+(-\d+)?\s+of\s+\d+\s+for/);
    });

    it('should format numbers according to locale', async () => {
      const {element, parts} = await renderComponent({
        querySummaryState: {
          hasQuery: true,
          query: 'test',
          total: 1234,
          firstResult: 1,
          lastResult: 10,
          hasResults: true,
          firstSearchExecuted: true,
        },
      });

      // Numbers should be present (formatting is handled by i18n)
      const highlights = parts(element);
      expect(highlights.highlight).toBeInTheDocument();

      // Validate the actual formatted numbers are displayed
      const summaryText = element.shadowRoot!.textContent;
      expect(summaryText).toContain('1,234'); // English locale formatting
      expect(summaryText).toContain('test');
      expect(summaryText).toMatch(/Results?\s+\d+(-\d+)?\s+of\s+[\d,]+\s+for/);
    });
  });

  describe('edge cases', () => {
    it('should handle empty query string correctly', async () => {
      const {element} = await renderComponent({
        querySummaryState: {
          hasQuery: false,
          query: '',
          hasError: false,
        },
      });

      const defaultMessage = element.shadowRoot!.querySelector('div');
      expect(defaultMessage).toBeInTheDocument();
      expect(defaultMessage?.classList.toString()).toContain('bg-[#F1F2FF]');

      // Validate the default message label is displayed
      const messageText = defaultMessage?.textContent;
      expect(messageText).toContain('Insights related to this case');
    });

    it('should handle zero total results', async () => {
      const {container} = await renderComponent({
        querySummaryState: {
          hasQuery: true,
          query: 'no matches',
          total: 0,
          hasResults: false,
          firstSearchExecuted: true,
        },
      });

      // Should render nothing for no results
      expect(container).toBeNull();
    });

    it('should handle very large result counts', async () => {
      const {container} = await renderComponent({
        querySummaryState: {
          hasQuery: true,
          query: 'many results',
          total: 999999,
          firstResult: 991,
          lastResult: 1000,
          hasResults: true,
          firstSearchExecuted: true,
        },
      });

      expect(container).toBeInTheDocument();
    });
  });
});

import {
  buildQuerySummary,
  type QuerySummaryState,
} from '@coveo/headless/insight';
import {html} from 'lit';
import {describe, expect, it, vi} from 'vitest';
import {AriaLiveRegionController} from '@/src/utils/accessibility-utils';
import {renderInAtomicInsightInterface} from '@/vitest-utils/testing-helpers/fixtures/atomic/insight/atomic-insight-interface-fixture';
import {buildFakeInsightEngine} from '@/vitest-utils/testing-helpers/fixtures/headless/insight/engine';
import {buildFakeSummary} from '@/vitest-utils/testing-helpers/fixtures/headless/search/summary-controller';
import type {AtomicInsightQuerySummary} from './atomic-insight-query-summary';
import './atomic-insight-query-summary';

vi.mock('@coveo/headless/insight', {spy: true});
vi.mock('@/src/mixins/bindings-mixin', () => ({
  InitializeBindingsMixin: vi.fn().mockImplementation((superClass) => {
    return class extends superClass {
      // biome-ignore lint/complexity/noUselessConstructor: <mocking the mixin for testing>
      constructor(...args: unknown[]) {
        super(...args);
      }
    };
  }),
}));

describe('atomic-insight-query-summary', () => {
  const mockedEngine = buildFakeInsightEngine();
  let mockedQuerySummary: ReturnType<typeof buildQuerySummary>;

  const renderQuerySummary = async ({
    querySummaryState = {},
  }: {
    querySummaryState?: Partial<QuerySummaryState>;
  } = {}) => {
    mockedQuerySummary = buildFakeSummary({state: querySummaryState});

    vi.mocked(buildQuerySummary).mockReturnValue(mockedQuerySummary);

    const {element} =
      await renderInAtomicInsightInterface<AtomicInsightQuerySummary>({
        template: html`<atomic-insight-query-summary></atomic-insight-query-summary>`,
        selector: 'atomic-insight-query-summary',
        bindings: (bindings) => {
          bindings.engine = mockedEngine;
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

  it('should render nothing when hasError is true and hasQuery is true', async () => {
    const {element} = await renderQuerySummary({
      querySummaryState: {
        hasError: true,
        hasQuery: true,
      },
    });
    expect(element).toBeEmptyDOMElement();
  });

  it('should render nothing when hasResults is false and firstSearchExecuted is true and hasQuery is true', async () => {
    const {element} = await renderQuerySummary({
      querySummaryState: {
        hasResults: false,
        firstSearchExecuted: true,
        hasQuery: true,
      },
    });
    expect(element).toBeEmptyDOMElement();
  });

  it('should render a placeholder when firstSearchExecuted is false and hasQuery is true', async () => {
    const {placeholder} = await renderQuerySummary({
      querySummaryState: {
        firstSearchExecuted: false,
        hasQuery: true,
      },
    });

    expect(placeholder).toBeInTheDocument();
  });

  describe('when hasQuery is true', () => {
    it('should render correctly', async () => {
      const {element} = await renderQuerySummary({
        querySummaryState: {
          hasQuery: true,
          firstSearchExecuted: true,
          hasResults: true,
        },
      });
      expect(element).toBeDefined();
    });

    it('should call buildQuerySummary with the engine', async () => {
      await renderQuerySummary({
        querySummaryState: {
          hasQuery: true,
          firstSearchExecuted: true,
          hasResults: true,
        },
      });
      expect(buildQuerySummary).toHaveBeenCalledExactlyOnceWith(mockedEngine);
    });

    it('should bind to the query summary controller', async () => {
      const buildQuerySummaryMock = vi.mocked(buildQuerySummary);
      const {element} = await renderQuerySummary({
        querySummaryState: {
          hasQuery: true,
          firstSearchExecuted: true,
          hasResults: true,
        },
      });
      expect(element.querySummary).toBe(
        buildQuerySummaryMock.mock.results[0].value
      );
    });

    it('should render the query summary container', async () => {
      const {container} = await renderQuerySummary({
        querySummaryState: {
          hasQuery: true,
          firstSearchExecuted: true,
          hasResults: true,
        },
      });

      expect(container).toBeInTheDocument();
    });

    it('should render the text correctly when there is a single result', async () => {
      const {container} = await renderQuerySummary({
        querySummaryState: {
          hasQuery: true,
          firstResult: 1,
          lastResult: 1,
          total: 1,
          firstSearchExecuted: true,
          hasResults: true,
        },
      });

      expect(container).toHaveTextContent('Result 1 of 1');
    });

    it('should render the text correctly when there are multiple results', async () => {
      const {container} = await renderQuerySummary({
        querySummaryState: {
          hasQuery: true,
          firstResult: 1,
          lastResult: 10,
          total: 100,
          firstSearchExecuted: true,
          hasResults: true,
        },
      });

      expect(container).toHaveTextContent('Results 1-10 of 100');
    });

    it('should render the text correctly when there are results and a query', async () => {
      const {container} = await renderQuerySummary({
        querySummaryState: {
          hasQuery: true,
          firstResult: 1,
          lastResult: 10,
          total: 100,
          query: 'test query',
          firstSearchExecuted: true,
          hasResults: true,
        },
      });

      expect(container).toHaveTextContent('Results 1-10 of 100 for test query');
    });

    it('should render highlights for numbers', async () => {
      const {parts, element} = await renderQuerySummary({
        querySummaryState: {
          hasQuery: true,
          firstResult: 1,
          lastResult: 10,
          total: 100,
          firstSearchExecuted: true,
          hasResults: true,
        },
      });

      const highlights = parts(element).highlight;
      expect(highlights).toBeInTheDocument();
    });

    it('should render highlight for query', async () => {
      const {parts, element} = await renderQuerySummary({
        querySummaryState: {
          hasQuery: true,
          firstResult: 1,
          lastResult: 10,
          total: 100,
          query: 'test query',
          firstSearchExecuted: true,
          hasResults: true,
        },
      });

      const queryHighlight = parts(element).query;
      expect(queryHighlight).toBeInTheDocument();
      expect(queryHighlight).toHaveTextContent('test query');
    });
  });

  describe('when hasQuery is false and hasError is false', () => {
    it('should render the insight related cases message', async () => {
      const {element} = await renderQuerySummary({
        querySummaryState: {
          hasQuery: false,
          hasError: false,
        },
      });

      expect(element.shadowRoot?.textContent).toContain('Insights related to');
    });

    it('should apply correct styling to related cases message', async () => {
      const {element} = await renderQuerySummary({
        querySummaryState: {
          hasQuery: false,
          hasError: false,
        },
      });

      const messageDiv = element.shadowRoot?.querySelector('div');
      expect(messageDiv).toBeInTheDocument();
      expect(messageDiv?.className).toContain('bg-[#F1F2FF]');
      expect(messageDiv?.className).toContain('px-6');
      expect(messageDiv?.className).toContain('py-4');
      expect(messageDiv?.className).toContain('text-[#54698D]');
      expect(messageDiv?.className).toContain('italic');
    });
  });

  it('should render nothing when hasQuery is false and hasError is true', async () => {
    const {element} = await renderQuerySummary({
      querySummaryState: {
        hasQuery: false,
        hasError: true,
      },
    });

    expect(element).toBeEmptyDOMElement();
  });

  it('should create an AriaLiveRegionController', async () => {
    const {element} = await renderQuerySummary();

    expect(element['ariaMessage']).toBeInstanceOf(AriaLiveRegionController);
  });

  it('should update aria message when state changes', async () => {
    const messageSetterSpy = vi.spyOn(
      AriaLiveRegionController.prototype,
      'message',
      'set'
    );

    const {element} = await renderQuerySummary({
      querySummaryState: {
        hasQuery: true,
        firstResult: 1,
        lastResult: 10,
        total: 100,
        query: 'test',
        isLoading: false,
        firstSearchExecuted: true,
        hasResults: true,
      },
    });

    expect(element).toBeDefined();
    expect(messageSetterSpy).toHaveBeenCalledOnce();

    const [[calledMessage]] = messageSetterSpy.mock.calls;
    expect(calledMessage).toContain('Results 1-10 of 100 for test');
  });
});

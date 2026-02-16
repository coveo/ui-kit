import {buildQuerySummary, type QuerySummaryState} from '@coveo/headless';
import {html} from 'lit';
import {describe, expect, it, vi} from 'vitest';
import {AriaLiveRegionController} from '@/src/utils/accessibility-utils';
import {renderInAtomicSearchInterface} from '@/vitest-utils/testing-helpers/fixtures/atomic/search/atomic-search-interface-fixture';
import {buildFakeSearchEngine} from '@/vitest-utils/testing-helpers/fixtures/headless/search/engine';
import {buildFakeSummary} from '@/vitest-utils/testing-helpers/fixtures/headless/search/summary-controller';
import type {AtomicQuerySummary} from './atomic-query-summary';
import './atomic-query-summary';

vi.mock('@coveo/headless', {spy: true});
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

describe('atomic-query-summary', () => {
  const mockedEngine = buildFakeSearchEngine();
  let mockedQuerySummary: ReturnType<typeof buildQuerySummary>;

  const renderQuerySummary = async ({
    querySummaryState = {},
  }: {
    querySummaryState?: Partial<QuerySummaryState>;
  } = {}) => {
    mockedQuerySummary = buildFakeSummary({state: querySummaryState});

    vi.mocked(buildQuerySummary).mockReturnValue(mockedQuerySummary);

    const {element} = await renderInAtomicSearchInterface<AtomicQuerySummary>({
      template: html`<atomic-query-summary></atomic-query-summary>`,
      selector: 'atomic-query-summary',
      bindings: (bindings) => {
        bindings.engine = mockedEngine;
        return bindings;
      },
    });

    return {
      element,
      placeholder: element.shadowRoot!.querySelector('[part="placeholder"]'),
      container: element.shadowRoot!.querySelector('[part="container"]'),
      parts: (element: AtomicQuerySummary) => {
        const qs = (part: string) =>
          element.shadowRoot?.querySelector(`[part*="${part}"]`);
        return {
          container: qs('container'),
          highlight: qs('highlight'),
          query: qs('query'),
          placeholder: qs('placeholder'),
          duration: qs('duration'),
        };
      },
    };
  };

  it('should render nothing when hasError is true', async () => {
    const {element} = await renderQuerySummary({
      querySummaryState: {
        hasError: true,
      },
    });
    expect(element).toBeEmptyDOMElement();
  });

  it('should render nothing when hasResults is false and firstSearchExecuted is true', async () => {
    const {element} = await renderQuerySummary({
      querySummaryState: {
        hasResults: false,
        firstSearchExecuted: true,
      },
    });
    expect(element).toBeEmptyDOMElement();
  });

  it('should render a placeholder when firstSearchExecuted is false', async () => {
    const {placeholder} = await renderQuerySummary({
      querySummaryState: {
        firstSearchExecuted: false,
      },
    });

    expect(placeholder).toBeInTheDocument();
  });

  describe('when hasError is false & hasResults is true & firstSearchExecuted is true', () => {
    it('should render correctly', async () => {
      const {element} = await renderQuerySummary();
      expect(element).toBeDefined();
    });

    it('should call buildQuerySummary with the engine', async () => {
      await renderQuerySummary();
      expect(buildQuerySummary).toHaveBeenCalledExactlyOnceWith(mockedEngine);
    });

    it('should bind to the query summary controller', async () => {
      const buildQuerySummaryMock = vi.mocked(buildQuerySummary);
      const {element} = await renderQuerySummary();
      expect(element.querySummary).toBe(
        buildQuerySummaryMock.mock.results[0].value
      );
    });

    it('should render the query summary container', async () => {
      const {container} = await renderQuerySummary();

      expect(container).toBeInTheDocument();
    });

    it('should render the text correctly when there is a single result', async () => {
      const {container} = await renderQuerySummary({
        querySummaryState: {
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

    it('should highlight the first, last, total, and query in the text', async () => {
      const {container} = await renderQuerySummary({
        querySummaryState: {
          firstResult: 1,
          lastResult: 10,
          total: 100,
          query: 'test query',
          firstSearchExecuted: true,
          hasResults: true,
        },
      });

      const highlightedElements = container!.querySelectorAll(
        '[part*="highlight"]'
      );
      expect(highlightedElements.length).toBe(4);
    });

    it('should render the duration part with the hidden class', async () => {
      const {element, parts} = await renderQuerySummary({
        querySummaryState: {
          durationInSeconds: 1.23,
          firstSearchExecuted: true,
          hasResults: true,
        },
      });

      const duration = parts(element).duration;
      expect(duration).toBeInTheDocument();
      expect(duration).toHaveTextContent('1.23');
      expect(duration).toHaveClass('hidden');
    });

    it('should format duration correctly with localized numbers', async () => {
      const {element, parts} = await renderQuerySummary({
        querySummaryState: {
          durationInSeconds: 1234567.89,
          firstSearchExecuted: true,
          hasResults: true,
        },
      });

      const duration = parts(element).duration;
      expect(duration).toHaveTextContent('1,234,567.89');
    });

    it('should handle loading state properly', async () => {
      const messageSetterSpy = vi.spyOn(
        AriaLiveRegionController.prototype,
        'message',
        'set'
      );

      const {element} = await renderQuerySummary({
        querySummaryState: {
          isLoading: true,
          firstSearchExecuted: true,
          hasResults: true,
        },
      });

      expect(element).toBeDefined();
      expect(messageSetterSpy).toHaveBeenCalledOnce();

      const [[calledMessage]] = messageSetterSpy.mock.calls;
      expect(calledMessage).toMatch(/loading/i);
    });

    it('should render container part', async () => {
      const {element, parts} = await renderQuerySummary({
        querySummaryState: {
          firstResult: 1,
          lastResult: 10,
          total: 100,
          query: 'test query',
          firstSearchExecuted: true,
          hasResults: true,
        },
      });

      const partsElements = parts(element);
      await expect.element(partsElements.container!).toBeInTheDocument();
    });

    it('should render highlight part', async () => {
      const {element, parts} = await renderQuerySummary({
        querySummaryState: {
          firstResult: 1,
          lastResult: 10,
          total: 100,
          query: 'test query',
          firstSearchExecuted: true,
          hasResults: true,
        },
      });

      const partsElements = parts(element);
      await expect.element(partsElements.highlight!).toBeInTheDocument();
    });

    it('should render query part', async () => {
      const {element, parts} = await renderQuerySummary({
        querySummaryState: {
          firstResult: 1,
          lastResult: 10,
          total: 100,
          query: 'test query',
          firstSearchExecuted: true,
          hasResults: true,
        },
      });

      const partsElements = parts(element);
      await expect.element(partsElements.query!).toBeInTheDocument();
    });

    it('should handle zero results gracefully', async () => {
      const {element} = await renderQuerySummary({
        querySummaryState: {
          firstResult: 0,
          lastResult: 0,
          total: 0,
          hasResults: false,
          firstSearchExecuted: true,
        },
      });

      expect(element).toBeEmptyDOMElement();
    });

    it('should handle empty query', async () => {
      const {container} = await renderQuerySummary({
        querySummaryState: {
          firstResult: 1,
          lastResult: 10,
          total: 100,
          query: '',
          firstSearchExecuted: true,
          hasResults: true,
        },
      });

      expect(container).toHaveTextContent('Results 1-10 of 100');
      expect(container).not.toHaveTextContent('for');
    });

    it('should localize numbers', async () => {
      const {container} = await renderQuerySummary({
        querySummaryState: {
          firstResult: 9991,
          lastResult: 10000,
          total: 1000000,
          firstSearchExecuted: true,
          hasResults: true,
        },
      });

      expect(container).toHaveTextContent('Results 9,991-10,000 of 1,000,000');
    });

    describe('when testing exact text format patterns', () => {
      it('should match exact format for multiple results with query and duration', async () => {
        const {container} = await renderQuerySummary({
          querySummaryState: {
            firstResult: 1,
            lastResult: 10,
            total: 1234,
            query: 'test',
            durationInSeconds: 0.47,
            firstSearchExecuted: true,
            hasResults: true,
            hasQuery: true,
            hasDuration: true,
          },
        });

        const textContent = (container?.textContent || '').trim();
        const pattern = /^Results 1-10 of [\d,]+ for test/;
        expect(textContent).toMatch(pattern);
      });

      it('should match exact format for single result with query and duration', async () => {
        const {container} = await renderQuerySummary({
          querySummaryState: {
            firstResult: 1,
            lastResult: 1,
            total: 1,
            query: "Queen's Gambit sparks world of online chess celebrities",
            durationInSeconds: 0.23,
            firstSearchExecuted: true,
            hasResults: true,
            hasQuery: true,
            hasDuration: true,
          },
        });

        const textContent = (container?.textContent || '').trim();
        const pattern =
          /^Result 1 of [\d,]+ for Queen's Gambit sparks world of online chess celebrities/;
        expect(textContent).toMatch(pattern);
      });
    });

    it('should not show a placeholder', async () => {
      const {placeholder} = await renderQuerySummary({
        querySummaryState: {
          firstSearchExecuted: true,
          hasResults: true,
          hasError: false,
        },
      });

      expect(placeholder).toBeFalsy();
    });
  });
});

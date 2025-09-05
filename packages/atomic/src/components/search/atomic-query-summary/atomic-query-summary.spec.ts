import {buildQuerySummary, type QuerySummaryState} from '@coveo/headless';
import {html} from 'lit';
import {describe, expect, it, vi} from 'vitest';
import {renderInAtomicSearchInterface} from '@/vitest-utils/testing-helpers/fixtures/atomic/search/atomic-search-interface-fixture';
import {buildFakeSearchEngine} from '@/vitest-utils/testing-helpers/fixtures/headless/search/engine';
import './atomic-query-summary';
import type {AtomicQuerySummary} from './atomic-query-summary';

vi.mock('@coveo/headless', {spy: true});

describe('atomic-query-summary', () => {
  const mockedEngine = buildFakeSearchEngine();
  let mockedQuerySummary: ReturnType<typeof buildQuerySummary>;

  const renderQuerySummary = async ({
    querySummaryState = {},
  }: {
    querySummaryState?: Partial<QuerySummaryState>;
  } = {}) => {
    const defaultState: QuerySummaryState = {
      firstSearchExecuted: true,
      hasResults: true,
      hasError: false,
      isLoading: false,
      total: 100,
      firstResult: 1,
      lastResult: 10,
      query: '',
      durationInSeconds: 0.5,
      durationInMilliseconds: 500,
      hasDuration: true,
      hasQuery: false,
    };

    mockedQuerySummary = {
      state: {
        ...defaultState,
        ...querySummaryState,
      },
      subscribe: vi.fn((callback: () => void) => {
        callback();
        return vi.fn();
      }),
    };

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

  it('should render correctly', async () => {
    const {element} = await renderQuerySummary();
    expect(element).toBeDefined();
  });

  it('should call buildQuerySummary with the engine', async () => {
    await renderQuerySummary();
    expect(buildQuerySummary).toHaveBeenCalledWith(mockedEngine);
  });

  it('should bind to the query summary controller', async () => {
    const {element} = await renderQuerySummary();
    expect(element.querySummary).toBe(mockedQuerySummary);
  });

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

    expect(placeholder).toBeTruthy();
    expect(placeholder).toBeInTheDocument();
  });

  it('should render the query summary container', async () => {
    const {container} = await renderQuerySummary();

    expect(container).toBeTruthy();
    expect(container).toBeInTheDocument();
  });

  it('should render the text correctly when there is a singular result', async () => {
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

    expect(container).toHaveTextContent('Results ');
    expect(container).toHaveTextContent('1');
    expect(container).toHaveTextContent('10');
    expect(container).toHaveTextContent('100');
    expect(container).toHaveTextContent('test query');

    const highlightedElements = container!.querySelectorAll(
      '[part*="highlight"]'
    );
    expect(highlightedElements.length).toBeGreaterThan(0);
  });

  it('should render the duration part (though hidden by default)', async () => {
    const {element, parts} = await renderQuerySummary({
      querySummaryState: {
        durationInSeconds: 1.23,
        firstSearchExecuted: true,
        hasResults: true,
      },
    });

    const duration = parts(element).duration;
    expect(duration).toBeTruthy();
    expect(duration).toBeInTheDocument();
    expect(duration).toHaveClass('hidden');
  });

  it('should format duration correctly with localized numbers', async () => {
    const {element, parts} = await renderQuerySummary({
      querySummaryState: {
        durationInSeconds: 1.234,
        firstSearchExecuted: true,
        hasResults: true,
      },
    });

    const duration = parts(element).duration;
    expect(duration).toHaveTextContent('1.234');
  });

  it('should handle loading state properly', async () => {
    const {element} = await renderQuerySummary({
      querySummaryState: {
        isLoading: true,
        firstSearchExecuted: true,
        hasResults: true,
      },
    });

    expect(element).toBeDefined();
  });

  it('should create the component with accessibility features', async () => {
    const {element} = await renderQuerySummary({
      querySummaryState: {
        firstResult: 1,
        lastResult: 10,
        total: 100,
        query: 'test',
        firstSearchExecuted: true,
        hasResults: true,
      },
    });

    expect(element).toBeDefined();
    expect(element.shadowRoot).toBeTruthy();
  });

  it('should render every part', async () => {
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
    await expect.element(partsElements.highlight!).toBeInTheDocument();
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

  it('should handle very large numbers', async () => {
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
});

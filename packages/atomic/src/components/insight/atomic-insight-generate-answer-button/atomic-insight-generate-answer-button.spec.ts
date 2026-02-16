import {
  buildQuerySummary,
  type QuerySummary,
  type QuerySummaryState,
} from '@coveo/headless/insight';
import {html} from 'lit';
import {beforeEach, describe, expect, it, vi} from 'vitest';
import {fixture} from '@/vitest-utils/testing-helpers/fixture.js';
import {genericSubscribe} from '@/vitest-utils/testing-helpers/fixtures/headless/common.js';
import {buildFakeInsightEngine} from '@/vitest-utils/testing-helpers/fixtures/headless/insight/engine.js';
import type {AtomicInsightGenerateAnswerButton} from './atomic-insight-generate-answer-button.js';
import './atomic-insight-generate-answer-button.js';

vi.mock('@coveo/headless/insight', {spy: true});

const buildFakeQuerySummary = ({
  state = {},
}: {
  state?: Partial<QuerySummaryState>;
} = {}): QuerySummary => {
  const defaultState: QuerySummaryState = {
    firstResult: 1,
    lastResult: 10,
    total: 100,
    query: '',
    durationInSeconds: 0.47,
    durationInMilliseconds: 470,
    firstSearchExecuted: true,
    hasResults: true,
    hasError: false,
    isLoading: false,
    hasDuration: true,
    hasQuery: false,
  };

  return {
    subscribe: genericSubscribe,
    state: {...defaultState, ...state},
  } as QuerySummary;
};

describe('atomic-insight-generate-answer-button', () => {
  let mockEngine: ReturnType<typeof buildFakeInsightEngine>;
  let element: AtomicInsightGenerateAnswerButton;

  const setupElement = async (
    props: {tooltip?: string} = {},
    querySummaryState: Partial<QuerySummaryState> = {}
  ) => {
    vi.mocked(buildQuerySummary).mockReturnValue(
      buildFakeQuerySummary({state: querySummaryState})
    );

    element = await fixture<AtomicInsightGenerateAnswerButton>(
      html`<atomic-insight-generate-answer-button
        .tooltip=${props.tooltip ?? 'Generate Answer'}
      ></atomic-insight-generate-answer-button>`
    );

    // Mock the bindings
    element.bindings = {
      engine: mockEngine,
      i18n: {} as never,
      store: {} as never,
      interfaceElement: {} as never,
      createStyleElement: vi.fn(),
      createScriptElement: vi.fn(),
    };

    // Initialize the component
    element.initialize();

    await element.updateComplete;
    return element;
  };

  beforeEach(() => {
    mockEngine = buildFakeInsightEngine();
  });

  describe('#initialize', () => {
    it('should build the QuerySummary controller', async () => {
      await setupElement();

      expect(buildQuerySummary).toHaveBeenCalledWith(mockEngine);
      expect(element.querySummary).toBe(
        vi.mocked(buildQuerySummary).mock.results[0].value
      );
    });
  });

  describe('rendering logic', () => {
    describe('when the query is empty and there are results', () => {
      it('should properly render the generate answer button with the default tooltip', async () => {
        const defaultTooltip = 'Generate Answer';
        await setupElement({}, {hasQuery: false, total: 5});

        const generateAnswerButton =
          element.shadowRoot?.querySelector('button');
        expect(generateAnswerButton).toBeVisible();
        expect(generateAnswerButton?.getAttribute('title')).toBe(
          defaultTooltip
        );
        expect(generateAnswerButton?.getAttribute('aria-label')).toBe(
          defaultTooltip
        );
      });

      it('should render the button with custom tooltip when specified', async () => {
        const customTooltip = 'Custom Generate Answer';
        await setupElement(
          {tooltip: customTooltip},
          {hasQuery: false, total: 5}
        );

        const generateAnswerButton =
          element.shadowRoot?.querySelector('button');
        expect(generateAnswerButton?.getAttribute('title')).toBe(customTooltip);
        expect(generateAnswerButton?.getAttribute('aria-label')).toBe(
          customTooltip
        );
      });
    });

    describe('when there is a query', () => {
      it('should not render the generate answer button', async () => {
        await setupElement({}, {hasQuery: true, total: 5});

        const generateAnswerButton =
          element.shadowRoot?.querySelector('button');
        expect(generateAnswerButton).toBeNull();
      });
    });

    describe('when total results is 0', () => {
      it('should not render the generate answer button', async () => {
        await setupElement({}, {hasQuery: false, total: 0});

        const generateAnswerButton =
          element.shadowRoot?.querySelector('button');
        expect(generateAnswerButton).toBeNull();
      });
    });

    describe('when there is a query and total results is 0', () => {
      it('should not render the generate answer button', async () => {
        await setupElement({}, {hasQuery: true, total: 0});

        const generateAnswerButton =
          element.shadowRoot?.querySelector('button');
        expect(generateAnswerButton).toBeNull();
      });
    });
  });
});

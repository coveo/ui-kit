import {
  buildDidYouMean,
  buildQueryTrigger,
  type DidYouMean,
  type DidYouMeanState,
  type QueryTrigger,
  type QueryTriggerState,
} from '@coveo/headless';
import {html} from 'lit';
import {ifDefined} from 'lit/directives/if-defined.js';
import {beforeEach, describe, expect, it, vi} from 'vitest';
import {userEvent} from 'vitest/browser';
import {renderInAtomicSearchInterface} from '@/vitest-utils/testing-helpers/fixtures/atomic/search/atomic-search-interface-fixture';
import {buildFakeDidYouMean} from '@/vitest-utils/testing-helpers/fixtures/headless/search/did-you-mean-controller';
import {buildFakeSearchEngine} from '@/vitest-utils/testing-helpers/fixtures/headless/search/engine';
import {buildFakeQueryTrigger} from '@/vitest-utils/testing-helpers/fixtures/headless/search/query-trigger-controller';
import type {AtomicDidYouMean} from './atomic-did-you-mean';
import './atomic-did-you-mean';

vi.mock('@coveo/headless', {spy: true});

describe('atomic-did-you-mean', () => {
  const mockedEngine = buildFakeSearchEngine();
  let mockedDidYouMean: DidYouMean;
  let mockedQueryTrigger: QueryTrigger;

  const renderDidYouMean = async ({
    didYouMeanState = {},
    queryTriggerState = {},
    automaticallyCorrectQuery,
    queryCorrectionMode,
  }: {
    didYouMeanState?: Partial<DidYouMeanState>;
    queryTriggerState?: Partial<QueryTriggerState>;
    automaticallyCorrectQuery?: boolean;
    queryCorrectionMode?: 'legacy' | 'next';
  } = {}) => {
    mockedDidYouMean = buildFakeDidYouMean({state: didYouMeanState});
    mockedQueryTrigger = buildFakeQueryTrigger(queryTriggerState);

    vi.mocked(buildDidYouMean).mockReturnValue(mockedDidYouMean);
    vi.mocked(buildQueryTrigger).mockReturnValue(mockedQueryTrigger);

    const {element} = await renderInAtomicSearchInterface<AtomicDidYouMean>({
      template: html`<atomic-did-you-mean
        .automaticallyCorrectQuery=${ifDefined(automaticallyCorrectQuery)}
        .queryCorrectionMode=${ifDefined(queryCorrectionMode)}
      ></atomic-did-you-mean>`,
      selector: 'atomic-did-you-mean',
      bindings: (bindings) => {
        bindings.engine = mockedEngine;
        return bindings;
      },
    });

    return {
      element,
      noResults: element.shadowRoot?.querySelector('p[part="no-results"]'),
      autoCorrected: element.shadowRoot?.querySelector(
        'p[part="auto-corrected"]'
      ),
      didYouMean: element.shadowRoot?.querySelector('p[part="did-you-mean"]'),
      showingResultsFor: element.shadowRoot?.querySelector(
        'p[part="showing-results-for"]'
      ),
      searchInsteadFor: element.shadowRoot?.querySelector(
        'p[part="search-instead-for"]'
      ),
      undoBtn: element.shadowRoot?.querySelector('button[part="undo-btn"]'),
    };
  };

  it('should call buildDidYouMean with engine and options', async () => {
    await renderDidYouMean({
      automaticallyCorrectQuery: false,
      queryCorrectionMode: 'legacy',
    });

    expect(buildDidYouMean).toHaveBeenCalledWith(
      mockedEngine,
      expect.anything()
    );
  });

  it('should call buildQueryTrigger with engine', async () => {
    await renderDidYouMean();

    expect(buildQueryTrigger).toHaveBeenCalledWith(mockedEngine);
  });

  it('should set this.didYouMean to the controller', async () => {
    const {element} = await renderDidYouMean();
    expect(element.didYouMean).toBe(mockedDidYouMean);
  });

  it('should set this.queryTrigger to the controller', async () => {
    const {element} = await renderDidYouMean();
    expect(element.queryTrigger).toBe(mockedQueryTrigger);
  });

  it('should not render anything when no correction states are available', async () => {
    const {element} = await renderDidYouMean({
      didYouMeanState: {hasQueryCorrection: false},
      queryTriggerState: {wasQueryModified: false},
    });

    expect(element).toHaveTextContent('');
  });

  it('should call buildDidYouMean with automaticallyCorrectQuery: true when automaticallyCorrectQuery is true', async () => {
    await renderDidYouMean();

    expect(buildDidYouMean).toHaveBeenCalledWith(
      mockedEngine,
      expect.objectContaining({
        options: expect.objectContaining({
          automaticallyCorrectQuery: true,
        }),
      })
    );
  });

  it('should call updateQueryCorrectionMode on the controller when queryCorrectionMode changes', async () => {
    const {element} = await renderDidYouMean({
      queryCorrectionMode: 'legacy',
    });

    const spy = vi.spyOn(element.didYouMean, 'updateQueryCorrectionMode');

    element.queryCorrectionMode = 'next';
    await element.updateComplete;

    expect(spy).toHaveBeenCalledWith('next');
  });

  describe('when query was automatically corrected', () => {
    let noResults: Element;
    let autoCorrected: Element;

    beforeEach(async () => {
      const rendered = await renderDidYouMean({
        didYouMeanState: {
          hasQueryCorrection: true,
          wasAutomaticallyCorrected: true,
          originalQuery: 'original search',
          wasCorrectedTo: 'corrected search',
        },
      });
      noResults = rendered.noResults!;
      autoCorrected = rendered.autoCorrected!;
    });

    it('should display the auto correction no results content', () => {
      expect(noResults).toHaveTextContent(
        "We couldn't find anything for original search"
      );
    });

    it('should set the correct part attribute for no results', () => {
      expect(noResults).toHaveAttribute('part', 'no-results');
    });

    it('should highlight the original search in no results', () => {
      expect(noResults?.querySelector('b[part="highlight"]')).toHaveTextContent(
        'original search'
      );
    });

    it('should display the auto correction auto corrected content', () => {
      expect(autoCorrected).toHaveTextContent(
        'Query was automatically corrected to corrected search'
      );
    });

    it('should set the correct part attribute for auto corrected', () => {
      expect(autoCorrected).toHaveAttribute('part', 'auto-corrected');
    });

    it('should highlight the corrected search in auto corrected', () => {
      expect(
        autoCorrected?.querySelector('b[part="highlight"]')
      ).toHaveTextContent('corrected search');
    });
  });

  describe('when query has manual correction available', () => {
    let didYouMean: Element;
    let element: AtomicDidYouMean;

    beforeEach(async () => {
      const rendered = await renderDidYouMean({
        didYouMeanState: {
          hasQueryCorrection: true,
          wasAutomaticallyCorrected: false,
          queryCorrection: {
            correctedQuery: 'suggested correction',
            wordCorrections: [],
          },
        },
      });
      didYouMean = rendered.didYouMean!;
      element = rendered.element;
    });

    it('should render correction did you mean text', () => {
      expect(didYouMean).toHaveTextContent(
        'Did you mean: suggested correction'
      );
    });

    it('should set the correct part attribute for did you mean', () => {
      expect(didYouMean).toHaveAttribute('part', 'did-you-mean');
    });

    it('should display suggested correction in button', () => {
      const correctionBtn = didYouMean?.querySelector(
        'button[part="correction-btn"]'
      );
      expect(correctionBtn).toHaveTextContent('suggested correction');
    });

    it('should call applyCorrection when correction button is clicked', async () => {
      const correctionBtn = didYouMean?.querySelector(
        'button[part="correction-btn"]'
      );
      const applyCorrectionSpy = vi.spyOn(
        element.didYouMean,
        'applyCorrection'
      );

      await userEvent.click(correctionBtn!);
      expect(applyCorrectionSpy).toHaveBeenCalled();
    });
  });

  describe('when query was modified by trigger', () => {
    let showingResultsFor: Element;
    let searchInsteadFor: Element;
    let undoBtn: Element;

    beforeEach(async () => {
      const rendered = await renderDidYouMean({
        queryTriggerState: {
          wasQueryModified: true,
          originalQuery: 'original query',
          newQuery: 'modified query',
        },
      });
      showingResultsFor = rendered.showingResultsFor!;
      searchInsteadFor = rendered.searchInsteadFor!;
      undoBtn = rendered.undoBtn!;
    });

    it('should display modified query in showing-results-for section', () => {
      expect(showingResultsFor).toHaveTextContent(
        'Showing results for modified query'
      );
      expect(
        showingResultsFor?.querySelector('b[part="highlight"]')
      ).toHaveTextContent('modified query');
    });

    it('should set the correct part attribute for showing-results-for', () => {
      expect(showingResultsFor).toHaveAttribute('part', 'showing-results-for');
    });

    it('should set the correct part attribute for search-instead-for', () => {
      expect(searchInsteadFor).toHaveAttribute('part', 'search-instead-for');
    });

    it('should set the correct part attribute for undo button', () => {
      expect(undoBtn).toHaveAttribute('part', 'undo-btn');
    });

    it('should display original query in undo button', () => {
      expect(undoBtn).toHaveTextContent('original query');
    });

    it('should call queryTrigger.undo when undo button is clicked', async () => {
      const spy = vi.spyOn(mockedQueryTrigger, 'undo');
      undoBtn?.dispatchEvent(new Event('click'));
      expect(spy).toHaveBeenCalled();
    });
  });
});

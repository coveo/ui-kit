import {
  buildPager as buildInsightPager,
  buildSearchStatus as buildInsightSearchStatus,
  type PagerState as InsightPagerState,
  type SearchStatusState as InsightSearchStatusState,
} from '@coveo/headless/insight';
import {page} from '@vitest/browser/context';
import {html} from 'lit';
import {ifDefined} from 'lit/directives/if-defined.js';
import {beforeEach, describe, expect, it, type MockInstance, vi} from 'vitest';
import {renderInAtomicInsightInterface} from '@/vitest-utils/testing-helpers/fixtures/atomic/insight/atomic-insight-interface-fixture';
import {genericSubscribe} from '@/vitest-utils/testing-helpers/fixtures/headless/common';
import type {AtomicInsightPager} from './atomic-insight-pager';
import './atomic-insight-pager';

// Mock headless at the top level
vi.mock('@coveo/headless/insight', {spy: true});

// Mock helper to create fake insight pager controller
const buildFakeInsightPager = (
  options: {state?: Partial<InsightPagerState>} = {}
) => ({
  state: {
    currentPage: 1,
    currentPages: [1, 2, 3, 4, 5],
    maxPage: 10,
    hasPreviousPage: options.state?.currentPage
      ? options.state.currentPage > 1
      : false,
    hasNextPage: options.state?.currentPage
      ? options.state.currentPage < 10
      : true,
    ...options.state,
  },
  subscribe: genericSubscribe,
  previousPage: vi.fn(),
  nextPage: vi.fn(),
  selectPage: vi.fn(),
  isCurrentPage: vi.fn(
    (pageNumber: number) => pageNumber === (options.state?.currentPage || 1)
  ),
});

// Mock helper to create fake insight search status controller
const buildFakeInsightSearchStatus = (
  options: {state?: Partial<InsightSearchStatusState>} = {}
) => ({
  state: {
    isLoading: false,
    hasError: false,
    hasResults: true,
    firstSearchExecuted: true,
    ...options.state,
  },
  subscribe: genericSubscribe,
});

describe('AtomicInsightPager', () => {
  const locators = {
    page1: page.getByLabelText('Page 1'),
    page2: page.getByLabelText('Page 2'),
    page3: page.getByLabelText('Page 3'),
    page4: page.getByLabelText('Page 4'),
    page5: page.getByLabelText('Page 5'),
    page6: page.getByLabelText('Page 6'),
    previous: page.getByLabelText('Previous'),
    next: page.getByLabelText('Next'),

    parts: (element: AtomicInsightPager) => {
      const qs = (part: string) =>
        element.shadowRoot?.querySelector(`[part="${part}"]`);
      return {
        pageButton: qs('page-button'),
        activePageButton: element.shadowRoot?.querySelector(
          '[part="page-button"][aria-pressed="true"]'
        ),
        previousButton: element.shadowRoot?.querySelector(
          '[aria-label="Previous"]'
        ),
        nextButton: element.shadowRoot?.querySelector('[aria-label="Next"]'),
      };
    },
  };

  const renderComponent = async (
    options: {
      numberOfPages?: number;
      pagerState?: Partial<InsightPagerState>;
      searchStatusState?: Partial<InsightSearchStatusState>;
    } = {}
  ) => {
    vi.mocked(buildInsightPager).mockReturnValue(
      buildFakeInsightPager({state: options.pagerState})
    );
    vi.mocked(buildInsightSearchStatus).mockReturnValue(
      buildFakeInsightSearchStatus({state: options.searchStatusState})
    );

    const {element} = await renderInAtomicInsightInterface<AtomicInsightPager>({
      template: html`<atomic-insight-pager
        number-of-pages=${ifDefined(options.numberOfPages)}
      ></atomic-insight-pager>`,
      selector: 'atomic-insight-pager',
      bindings: (bindings) => {
        bindings.store.onChange = vi.fn();
        bindings.store.state.resultList = {
          focusOnFirstResultAfterNextSearch: vi.fn(),
          focusOnNextNewResult: vi.fn(),
        };
        return bindings;
      },
    });

    return element;
  };

  it('should render correctly', async () => {
    const element = await renderComponent();
    expect(element).toBeDefined();
  });

  it('should render with default numberOfPages property', async () => {
    const element = await renderComponent();
    expect(element.numberOfPages).toBe(5);
  });

  it('should initialize pager and searchStatus controllers', async () => {
    const element = await renderComponent();

    expect(buildInsightPager).toHaveBeenCalledWith(element.bindings.engine, {
      options: {numberOfPages: 5},
    });
    expect(buildInsightSearchStatus).toHaveBeenCalledWith(
      element.bindings.engine
    );
    expect(element.pager).toBeDefined();
    expect(element.searchStatus).toBeDefined();
  });

  it('should update numberOfPages when property changes', async () => {
    const element = await renderComponent({numberOfPages: 7});
    expect(element.numberOfPages).toBe(7);
  });

  it('should show the proper page range by default', async () => {
    await renderComponent();

    await expect.element(locators.page1).toBeInTheDocument();
    await expect.element(locators.page2).toBeInTheDocument();
    await expect.element(locators.page3).toBeInTheDocument();
    await expect.element(locators.page4).toBeInTheDocument();
    await expect.element(locators.page5).toBeInTheDocument();
    await expect.element(locators.page6).not.toBeInTheDocument();
  });

  it('should respect the numberOfPages property', async () => {
    await renderComponent({
      numberOfPages: 3,
      pagerState: {
        currentPages: [1, 2, 3], // Explicitly set the pages to match numberOfPages
      },
    });

    await expect.element(locators.page1).toBeInTheDocument();
    await expect.element(locators.page2).toBeInTheDocument();
    await expect.element(locators.page3).toBeInTheDocument();
    await expect.element(locators.page4).not.toBeInTheDocument();
  });

  it('should disable the previous button when on the first page', async () => {
    await renderComponent({
      pagerState: {currentPage: 1, hasPreviousPage: false},
    });

    await expect.element(locators.previous).toHaveAttribute('disabled');
  });

  it('should disable the next button when on the last page', async () => {
    await renderComponent({
      pagerState: {currentPage: 10, hasNextPage: false},
    });

    await expect.element(locators.next).toHaveAttribute('disabled');
  });

  it('should enable the previous button when not on the first page', async () => {
    await renderComponent({
      pagerState: {currentPage: 2, hasPreviousPage: true},
    });

    await expect.element(locators.previous).not.toHaveAttribute('disabled');
  });

  it('should enable the next button when not on the last page', async () => {
    await renderComponent({
      pagerState: {currentPage: 5, hasNextPage: true},
    });

    await expect.element(locators.next).not.toHaveAttribute('disabled');
  });

  describe('when clicking on the previous button', () => {
    let focusSpy: MockInstance;
    let eventSpy: MockInstance;
    let previousSpy: MockInstance;
    let element: AtomicInsightPager;

    beforeEach(async () => {
      element = await renderComponent({
        pagerState: {currentPage: 2, hasPreviousPage: true},
      });
      focusSpy = vi.spyOn(
        element.bindings.store.state.resultList!,
        'focusOnFirstResultAfterNextSearch'
      );
      eventSpy = vi.spyOn(element, 'dispatchEvent');
      previousSpy = vi.spyOn(element.pager, 'previousPage');

      await locators.previous.click();
    });

    it('should call previousPage on the pager controller', () => {
      expect(previousSpy).toHaveBeenCalled();
    });

    it('should call focusOnFirstResultAfterNextSearch', () => {
      expect(focusSpy).toHaveBeenCalled();
    });

    it('should dispatch atomic/scrollToTop event', () => {
      expect(eventSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'atomic/scrollToTop',
          bubbles: true,
          composed: true,
        })
      );
    });
  });

  describe('when clicking on the next button', () => {
    let focusSpy: MockInstance;
    let eventSpy: MockInstance;
    let nextSpy: MockInstance;
    let element: AtomicInsightPager;

    beforeEach(async () => {
      element = await renderComponent({
        pagerState: {currentPage: 1, hasNextPage: true},
      });
      focusSpy = vi.spyOn(
        element.bindings.store.state.resultList!,
        'focusOnFirstResultAfterNextSearch'
      );
      eventSpy = vi.spyOn(element, 'dispatchEvent');
      nextSpy = vi.spyOn(element.pager, 'nextPage');

      await locators.next.click();
    });

    it('should call nextPage on the pager controller', () => {
      expect(nextSpy).toHaveBeenCalled();
    });

    it('should call focusOnFirstResultAfterNextSearch', () => {
      expect(focusSpy).toHaveBeenCalled();
    });

    it('should dispatch atomic/scrollToTop event', () => {
      expect(eventSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'atomic/scrollToTop',
          bubbles: true,
          composed: true,
        })
      );
    });
  });

  describe('when clicking on a page button', () => {
    let focusSpy: MockInstance;
    let eventSpy: MockInstance;
    let selectPageSpy: MockInstance;
    let element: AtomicInsightPager;

    beforeEach(async () => {
      element = await renderComponent({
        pagerState: {
          currentPage: 1,
          currentPages: [1, 2, 3, 4, 5],
        },
      });
      focusSpy = vi.spyOn(
        element.bindings.store.state.resultList!,
        'focusOnFirstResultAfterNextSearch'
      );
      eventSpy = vi.spyOn(element, 'dispatchEvent');
      selectPageSpy = vi.spyOn(element.pager, 'selectPage');

      await locators.page2.click();
    });

    it('should call selectPage with the correct page number', () => {
      expect(selectPageSpy).toHaveBeenCalledWith(2);
    });

    it('should call focusOnFirstResultAfterNextSearch', () => {
      expect(focusSpy).toHaveBeenCalled();
    });

    it('should dispatch atomic/scrollToTop event', () => {
      expect(eventSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'atomic/scrollToTop',
          bubbles: true,
          composed: true,
        })
      );
    });
  });

  describe('when no results are available', () => {
    it('should handle empty current pages gracefully', async () => {
      await renderComponent({
        pagerState: {
          currentPages: [],
        },
      });

      await expect.element(locators.page1).not.toBeInTheDocument();
      await expect.element(locators.page2).not.toBeInTheDocument();
    });
  });

  describe('when only one page exists', () => {
    it('should render single page correctly', async () => {
      await renderComponent({
        pagerState: {
          currentPages: [1],
          hasPreviousPage: false,
          hasNextPage: false,
        },
      });

      await expect.element(locators.page1).toBeInTheDocument();
      await expect.element(locators.page2).not.toBeInTheDocument();
    });
  });

  it('should render all expected shadow DOM parts', async () => {
    const element = await renderComponent();
    const parts = locators.parts(element);

    expect(parts.pageButton).toBeInTheDocument();
    expect(parts.previousButton).toBeInTheDocument();
    expect(parts.nextButton).toBeInTheDocument();
  });

  it('should mark the current page as active', async () => {
    const element = await renderComponent({
      pagerState: {currentPage: 3},
    });

    // The isCurrentPage method should be called to determine active state
    expect(element.pager.isCurrentPage).toHaveBeenCalledWith(3);
  });

  it('should apply correct styling classes from CSS', async () => {
    const element = await renderComponent();

    // Check that the host has the expected styles applied
    const hostStyles = getComputedStyle(element);
    expect(hostStyles.display).toBe('flex');
  });

  describe('#initialize', () => {
    it('should initialize controllers with correct options', async () => {
      const element = await renderComponent({numberOfPages: 7});

      expect(buildInsightPager).toHaveBeenCalledWith(element.bindings.engine, {
        options: {numberOfPages: 7},
      });
      expect(buildInsightSearchStatus).toHaveBeenCalledWith(
        element.bindings.engine
      );
    });
  });

  describe('when pager state changes', () => {
    it('should update page buttons based on currentPages', async () => {
      await renderComponent({
        pagerState: {
          currentPages: [5, 6, 7, 8, 9],
        },
      });

      await expect.element(page.getByLabelText('Page 5')).toBeInTheDocument();
      await expect.element(page.getByLabelText('Page 6')).toBeInTheDocument();
      await expect.element(page.getByLabelText('Page 7')).toBeInTheDocument();
      await expect.element(page.getByLabelText('Page 8')).toBeInTheDocument();
      await expect.element(page.getByLabelText('Page 9')).toBeInTheDocument();
    });
  });

  describe('accessibility', () => {
    it('should have proper ARIA labels for navigation buttons', async () => {
      await renderComponent();

      await expect.element(locators.previous).toHaveAttribute('aria-label');
      await expect.element(locators.next).toHaveAttribute('aria-label');
    });

    it('should have proper ARIA labels for page buttons', async () => {
      await renderComponent();

      await expect.element(locators.page1).toHaveAttribute('aria-label');
      await expect.element(locators.page2).toHaveAttribute('aria-label');
    });

    it('should use radio button behavior for page selection', async () => {
      const element = await renderComponent();

      // Radio buttons should share the same name attribute for proper grouping
      const radioButtons = element.shadowRoot?.querySelectorAll(
        'input[type="radio"]'
      );
      expect(radioButtons?.length).toBeGreaterThan(0);

      if (radioButtons && radioButtons.length > 1) {
        const firstName = radioButtons[0].getAttribute('name');
        const secondName = radioButtons[1].getAttribute('name');
        expect(firstName).toBe(secondName);
      }
    });
  });
});

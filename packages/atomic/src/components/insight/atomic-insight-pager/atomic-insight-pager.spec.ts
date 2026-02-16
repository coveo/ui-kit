import {
  buildPager as buildInsightPager,
  buildSearchStatus as buildInsightSearchStatus,
  type PagerState as InsightPagerState,
  type SearchStatusState as InsightSearchStatusState,
} from '@coveo/headless/insight';
import {html} from 'lit';
import {ifDefined} from 'lit/directives/if-defined.js';
import {beforeEach, describe, expect, it, type MockInstance, vi} from 'vitest';
import {page} from 'vitest/browser';
import {renderInAtomicInsightInterface} from '@/vitest-utils/testing-helpers/fixtures/atomic/insight/atomic-insight-interface-fixture';
import {buildFakePager} from '@/vitest-utils/testing-helpers/fixtures/headless/search/pager-controller';
import {buildFakeSearchStatus} from '@/vitest-utils/testing-helpers/fixtures/headless/search/search-status-controller';
import type {AtomicInsightPager} from './atomic-insight-pager';
import './atomic-insight-pager';

vi.mock('@coveo/headless/insight', {spy: true});

describe('atomic-insight-pager', () => {
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
        buttons: qs('buttons'),
        pageButtons: qs('page-buttons'),
        pageButton: qs('page-button'),
        activePageButton: qs('active-page-button'),
        previousButton: qs('previous-button'),
        nextButton: qs('next-button'),
        previousButtonIcon: qs('previous-button-icon'),
        nextButtonIcon: qs('next-button-icon'),
      };
    },
  };

  const renderPager = async ({
    props = {},
    pagerState,
    searchStatusState,
  }: {
    props?: Partial<{
      numberOfPages: number;
    }>;
    pagerState?: Partial<InsightPagerState>;
    searchStatusState?: Partial<InsightSearchStatusState>;
  } = {}) => {
    vi.mocked(buildInsightPager).mockReturnValue(
      buildFakePager({state: {maxPage: 5, ...pagerState}})
    );
    vi.mocked(buildInsightSearchStatus).mockReturnValue(
      buildFakeSearchStatus({
        hasError: false,
        hasResults: true,
        ...searchStatusState,
      })
    );

    const {element} = await renderInAtomicInsightInterface<AtomicInsightPager>({
      template: html`
        <atomic-insight-pager
          number-of-pages=${ifDefined(props.numberOfPages)}
        ></atomic-insight-pager>
      `,
      selector: 'atomic-insight-pager',
      bindings: (bindings) => {
        bindings.store.onChange = vi.fn();
        bindings.store.state.resultList = {
          focusOnFirstResultAfterNextSearch: vi.fn(),
          focusOnNextNewResult: vi.fn(),
        };
        bindings.store.state.loadingFlags = [];
        return bindings;
      },
    });

    return element;
  };

  it('should create the component', async () => {
    const element = await renderPager();
    expect(element).toBeDefined();
  });

  it('should not show pager when maxPage is 1', async () => {
    await renderPager({
      pagerState: {maxPage: 1},
    });

    await expect.element(locators.page1).not.toBeInTheDocument();
  });

  it('should show pager when maxPage is greater than 1', async () => {
    await renderPager({
      pagerState: {maxPage: 5},
    });

    await expect.element(locators.page1).toBeInTheDocument();
  });

  it('should call buildInsightPager with correct engine and options', async () => {
    const element = await renderPager({
      props: {numberOfPages: 7},
    });

    expect(buildInsightPager).toHaveBeenCalledWith(element.bindings.engine, {
      options: {numberOfPages: 7},
    });
  });

  it('should call buildInsightSearchStatus with correct engine', async () => {
    const element = await renderPager();

    expect(buildInsightSearchStatus).toHaveBeenCalledWith(
      element.bindings.engine
    );
  });

  describe('previous button', () => {
    it('should be disabled when there is no previous page', async () => {
      await renderPager({
        pagerState: {hasPreviousPage: false},
      });

      await expect.element(locators.previous).toHaveAttribute('disabled');
    });

    it('should not be disabled when there is a previous page', async () => {
      await renderPager({
        pagerState: {hasPreviousPage: true},
      });

      await expect.element(locators.previous).not.toHaveAttribute('disabled');
    });

    describe('when clicking previous button', () => {
      let previousSpy: MockInstance;
      let focusSpy: MockInstance;
      let eventSpy: MockInstance;
      let element: AtomicInsightPager;

      beforeEach(async () => {
        element = await renderPager({
          pagerState: {hasPreviousPage: true},
        });
        focusSpy = vi.spyOn(
          element.bindings.store.state.resultList!,
          'focusOnFirstResultAfterNextSearch'
        );
        eventSpy = vi.spyOn(element, 'dispatchEvent');
        previousSpy = vi.spyOn(element.pager, 'previousPage');
        await locators.previous.click();
      });

      it('should call #pager.previousPage', async () => {
        expect(previousSpy).toHaveBeenCalledOnce();
      });

      it('should call #focusOnFirstResultAfterNextSearch', async () => {
        expect(focusSpy).toHaveBeenCalled();
      });

      it("should dispatch an 'atomic/scrollToTop' custom event", async () => {
        expect(eventSpy).toHaveBeenCalledWith(
          new CustomEvent('atomic/scrollToTop')
        );
      });

      it('should have accessibility features properly set up', async () => {
        expect(
          element.shadowRoot?.querySelector('[part*="previous-button"]')
        ).toBeDefined();
        expect(previousSpy).toHaveBeenCalledOnce();
        expect(focusSpy).toHaveBeenCalledOnce();
      });
    });
  });

  describe('next button', () => {
    it('should be disabled when there is no next page', async () => {
      await renderPager({
        pagerState: {hasNextPage: false},
      });

      await expect.element(locators.next).toHaveAttribute('disabled');
    });

    describe('when clicking next button', () => {
      let nextSpy: MockInstance;
      let focusSpy: MockInstance;
      let element: AtomicInsightPager;

      beforeEach(async () => {
        element = await renderPager({
          pagerState: {hasNextPage: true},
        });
        focusSpy = vi.spyOn(
          element.bindings.store.state.resultList!,
          'focusOnFirstResultAfterNextSearch'
        );
        nextSpy = vi.spyOn(element.pager, 'nextPage');
        await locators.next.click();
      });

      it('should call #pager.nextPage', async () => {
        expect(nextSpy).toHaveBeenCalledOnce();
      });

      it('should call #focusOnFirstResultAfterNextSearch', async () => {
        expect(focusSpy).toHaveBeenCalled();
      });

      it('should have accessibility features properly set up', async () => {
        expect(
          element.shadowRoot?.querySelector('[part*="next-button"]')
        ).toBeDefined();
        expect(nextSpy).toHaveBeenCalledOnce();
        expect(focusSpy).toHaveBeenCalledOnce();
      });
    });

    it('should not be disabled when there is a next page', async () => {
      await renderPager({
        pagerState: {hasNextPage: true},
      });

      await expect.element(locators.next).not.toHaveAttribute('disabled');
    });
  });

  describe('when clicking on a page button', () => {
    let focusSpy: MockInstance;
    let eventSpy: MockInstance;
    let selectPageSpy: MockInstance;
    let element: AtomicInsightPager;

    beforeEach(async () => {
      element = await renderPager({
        pagerState: {currentPages: [1, 2, 3, 4, 5], currentPage: 1},
      });
      focusSpy = vi.spyOn(
        element.bindings.store.state.resultList!,
        'focusOnFirstResultAfterNextSearch'
      );
      eventSpy = vi.spyOn(element, 'dispatchEvent');
      selectPageSpy = vi.spyOn(element.pager, 'selectPage');
      await locators.page3.click();
    });

    it('should call #focusOnFirstResultAfterNextSearch', async () => {
      expect(focusSpy).toHaveBeenCalled();
    });

    it("should dispatch an 'atomic/scrollToTop' custom event", async () => {
      expect(eventSpy).toHaveBeenCalledWith(
        new CustomEvent('atomic/scrollToTop')
      );
    });

    it('should call #pager.selectPage with correct page number', async () => {
      expect(selectPageSpy).toHaveBeenCalledWith(3);
    });
  });

  it('should render the proper value on the page buttons', async () => {
    await renderPager();

    await expect.element(locators.page1).toHaveAttribute('value', '1');
    await expect.element(locators.page2).toHaveAttribute('value', '2');
    await expect.element(locators.page3).toHaveAttribute('value', '3');
  });

  it('should have the selected button as active', async () => {
    await renderPager();

    await expect
      .element(locators.page1)
      .toHaveAttribute('part', expect.stringContaining('active-page-button'));
    await expect.element(locators.page2).toHaveAttribute('part', 'page-button');
  });

  it('should render all expected parts', async () => {
    const element = await renderPager();

    expect(
      element.shadowRoot?.querySelector('[part*="buttons"]')
    ).toBeDefined();
    expect(
      element.shadowRoot?.querySelector('[part*="page-button"]')
    ).toBeDefined();
    expect(
      element.shadowRoot?.querySelector('[part*="previous-button"]')
    ).toBeDefined();
    expect(
      element.shadowRoot?.querySelector('[part*="next-button"]')
    ).toBeDefined();
    expect(
      element.shadowRoot?.querySelector('[part*="previous-button-icon"]')
    ).toBeDefined();
    expect(
      element.shadowRoot?.querySelector('[part*="next-button-icon"]')
    ).toBeDefined();
  });

  describe('when pager state changes', () => {
    it('should update currentPages', async () => {
      const element = await renderPager({
        pagerState: {currentPages: [6, 7, 8, 9, 10]},
      });

      expect(element.pagerState.currentPages).toEqual([6, 7, 8, 9, 10]);
    });

    it('should update hasPreviousPage', async () => {
      const element = await renderPager({
        pagerState: {hasPreviousPage: false},
      });

      expect(element.pagerState.hasPreviousPage).toBe(false);
    });

    it('should update hasNextPage', async () => {
      const element = await renderPager({
        pagerState: {hasNextPage: false},
      });

      expect(element.pagerState.hasNextPage).toBe(false);
    });
  });

  describe('when search status state changes', () => {
    it('should update hasError', async () => {
      const element = await renderPager({
        searchStatusState: {hasError: true},
      });

      expect(element.searchStatusState.hasError).toBe(true);
    });

    it('should update hasResults', async () => {
      const element = await renderPager({
        searchStatusState: {hasResults: false},
      });

      expect(element.searchStatusState.hasResults).toBe(false);
    });
  });

  it('should allow numberOfPages of 0', async () => {
    const consoleErrorSpy = vi
      .spyOn(console, 'error')
      .mockImplementation(() => {});

    await renderPager({props: {numberOfPages: 0}});

    expect(consoleErrorSpy).not.toHaveBeenCalled();
  });

  it('should handle validation error when numberOfPages is negative during initialization', async () => {
    const element = await renderPager({props: {numberOfPages: -1}});

    expect(element.error).toBeDefined();
    expect(element.error.message).toContain('minimum value of 0 not respected');
  });

  it('should handle numberOfPages as string number', async () => {
    const element = await renderPager();

    element.setAttribute('number-of-pages', '8');
    await element.updateComplete;

    expect(element.numberOfPages).toBe(8);
  });

  it('should render with proper ARIA labels', async () => {
    await renderPager({
      searchStatusState: {hasError: false, hasResults: true},
    });

    await expect
      .element(locators.page1)
      .toHaveAttribute('aria-label', 'Page 1');
    await expect
      .element(locators.previous)
      .toHaveAttribute('aria-label', 'Previous');
    await expect.element(locators.next).toHaveAttribute('aria-label', 'Next');
  });

  it('should use keyed directive for page buttons', async () => {
    await renderPager({
      pagerState: {currentPages: [3, 4, 5, 6, 7]},
    });

    await expect.element(locators.page3).toHaveAttribute('value', '3');
    await expect.element(locators.page4).toHaveAttribute('value', '4');
    await expect.element(locators.page5).toHaveAttribute('value', '5');
  });

  describe('accessibility', () => {
    let element: AtomicInsightPager;

    beforeEach(async () => {
      element = await renderPager({pagerState: {currentPage: 2, maxPage: 10}});
    });

    const retrieveButtons = () => {
      return Array.from(
        element.shadowRoot?.querySelectorAll<HTMLInputElement>(
          'input[type="radio"]'
        ) || []
      );
    };

    it('should render radio buttons for page navigation', async () => {
      const buttons = retrieveButtons();
      expect(buttons.length).toBeGreaterThan(0);
    });

    it('should have proper ARIA labels on buttons', async () => {
      await expect
        .element(locators.previous)
        .toHaveAttribute('aria-label', 'Previous');
      await expect.element(locators.next).toHaveAttribute('aria-label', 'Next');
      await expect
        .element(locators.page1)
        .toHaveAttribute('aria-label', 'Page 1');
    });

    it('should have proper radio button grouping', async () => {
      const buttons = retrieveButtons();
      const firstButton = buttons[0];
      const groupName = firstButton?.getAttribute('name');

      expect(groupName).toBeDefined();
      buttons.forEach((button) => {
        expect(button.getAttribute('name')).toBe(groupName);
      });
    });

    it('should support keyboard navigation between page buttons', async () => {
      const buttons = retrieveButtons();
      expect(buttons.length).toBeGreaterThan(1);

      const groupNames = buttons.map((btn) => btn.getAttribute('name'));
      const uniqueNames = new Set(groupNames);
      expect(uniqueNames.size).toBe(1);

      buttons.forEach((button) => {
        expect(button.type).toBe('radio');
        expect(button.getAttribute('aria-label')).toBeDefined();
      });
    });

    it('should handle arrow key navigation focus management', async () => {
      const buttons = retrieveButtons();
      const previousBtn = element.shadowRoot?.querySelector(
        '[part*="previous-button"]'
      ) as HTMLElement;
      const nextBtn = element.shadowRoot?.querySelector(
        '[part*="next-button"]'
      ) as HTMLElement;

      expect(buttons.length).toBeGreaterThan(0);
      expect(previousBtn).toBeDefined();
      expect(nextBtn).toBeDefined();

      expect(previousBtn?.getAttribute('aria-label')).toBe('Previous');
      expect(nextBtn?.getAttribute('aria-label')).toBe('Next');

      expect(previousBtn?.tabIndex).toBeDefined();
      expect(nextBtn?.tabIndex).toBeDefined();
    });

    it('should manage focus correctly for screen reader navigation', async () => {
      const buttons = retrieveButtons();

      buttons.forEach((button) => {
        expect(button.type).toBe('radio');
        expect(button.getAttribute('aria-label')).toBeDefined();
        expect(button.getAttribute('name')).toBeDefined();
      });

      await expect
        .element(locators.previous)
        .toHaveAttribute('aria-label', 'Previous');
      await expect.element(locators.next).toHaveAttribute('aria-label', 'Next');

      const prevElement = element.shadowRoot?.querySelector(
        '[part*="previous-button"]'
      );
      const nextElement = element.shadowRoot?.querySelector(
        '[part*="next-button"]'
      );
      expect(prevElement).toBeDefined();
      expect(nextElement).toBeDefined();
    });
  });
});

import {
  buildPager,
  buildSearchStatus,
  type PagerState,
  type SearchStatusState,
} from '@coveo/headless';
import {page} from '@vitest/browser/context';
import {html} from 'lit';
import {ifDefined} from 'lit/directives/if-defined.js';
import {beforeEach, describe, expect, it, type MockInstance, vi} from 'vitest';
import {renderInAtomicSearchInterface} from '@/vitest-utils/testing-helpers/fixtures/atomic/search/atomic-search-interface-fixture';
import {buildFakePager} from '@/vitest-utils/testing-helpers/fixtures/headless/search/pager-controller';
import {buildFakeSearchStatus} from '@/vitest-utils/testing-helpers/fixtures/headless/search/search-status-controller';
import type {AtomicPager} from './atomic-pager';
import './atomic-pager';

vi.mock('@coveo/headless', {spy: true});

describe('atomic-pager', () => {
  const locators = {
    page1: page.getByLabelText('Page 1'),
    page2: page.getByLabelText('Page 2'),
    page3: page.getByLabelText('Page 3'),
    page4: page.getByLabelText('Page 4'),
    page5: page.getByLabelText('Page 5'),
    page6: page.getByLabelText('Page 6'),
    previous: page.getByLabelText('Previous'),
    next: page.getByLabelText('Next'),
    parts: (element: AtomicPager) => {
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
    numberOfPages,
    previousButtonIcon,
    nextButtonIcon,
    pagerState,
    searchStatusState,
    isAppLoaded = true,
  }: {
    numberOfPages?: number;
    previousButtonIcon?: string;
    nextButtonIcon?: string;
    pagerState?: Partial<PagerState>;
    searchStatusState?: Partial<SearchStatusState>;
    isAppLoaded?: boolean;
  } = {}) => {
    vi.mocked(buildPager).mockReturnValue(buildFakePager({state: pagerState}));
    vi.mocked(buildSearchStatus).mockReturnValue(
      buildFakeSearchStatus({state: searchStatusState})
    );

    const {element} = await renderInAtomicSearchInterface<AtomicPager>({
      template: html`<atomic-pager
        number-of-pages=${ifDefined(numberOfPages)}
        previous-button-icon=${ifDefined(previousButtonIcon)}
        next-button-icon=${ifDefined(nextButtonIcon)}
      ></atomic-pager>`,
      selector: 'atomic-pager',
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

    element['isAppLoaded'] = isAppLoaded;

    return element;
  };

  it('should render correctly', async () => {
    const element = await renderPager();
    expect(element).toBeDefined();
  });

  it('should render with default properties', async () => {
    const element = await renderPager();
    expect(element.numberOfPages).toBe(5);
    expect(element.previousButtonIcon).toBeDefined();
    expect(element.nextButtonIcon).toBeDefined();
  });

  it('should call buildPager with engine and numberOfPages option', async () => {
    const element = await renderPager({numberOfPages: 7});

    expect(buildPager).toHaveBeenCalledWith(element.bindings.engine, {
      options: {numberOfPages: 7},
    });
    expect(element.pager).toBeDefined();
  });

  it('should call buildSearchStatus with engine', async () => {
    const element = await renderPager();

    expect(buildSearchStatus).toHaveBeenCalledWith(element.bindings.engine);
    expect(element.searchStatus).toBeDefined();
  });

  it('should show the proper page range by default', async () => {
    await renderPager();

    await expect.element(locators.page1).toBeInTheDocument();
    await expect.element(locators.page2).toBeInTheDocument();
    await expect.element(locators.page3).toBeInTheDocument();
    await expect.element(locators.page4).toBeInTheDocument();
    await expect.element(locators.page5).toBeInTheDocument();
    await expect.element(locators.page6).not.toBeInTheDocument();
  });

  it('should render correct number of pages when numberOfPages is set to 10', async () => {
    const element = await renderPager({
      numberOfPages: 10,
    });

    expect(buildPager).toHaveBeenCalledWith(element.bindings.engine, {
      options: {numberOfPages: 10},
    });
  });

  it('should update numberOfPages when property changes', async () => {
    const element = await renderPager({
      numberOfPages: 3,
      pagerState: {currentPages: [1, 2, 3]},
    });
    expect(element.numberOfPages).toBe(3);

    expect(buildPager).toHaveBeenCalledWith(element.bindings.engine, {
      options: {numberOfPages: 3},
    });
  });

  it('should handle numberOfPages property validation', async () => {
    const consoleErrorSpy = vi
      .spyOn(console, 'error')
      .mockImplementation(() => {});

    await renderPager({numberOfPages: 0});
    await renderPager({numberOfPages: 10});

    expect(consoleErrorSpy).toHaveBeenCalledTimes(0);
  });

  it('should not render when search has error', async () => {
    await renderPager({searchStatusState: {hasError: true}});

    await expect.element(locators.page1).not.toBeInTheDocument();
    await expect.element(locators.previous).not.toBeInTheDocument();
    await expect.element(locators.next).not.toBeInTheDocument();
  });

  it('should not render when search has no results', async () => {
    await renderPager({searchStatusState: {hasResults: false}});

    await expect.element(locators.page1).not.toBeInTheDocument();
    await expect.element(locators.previous).not.toBeInTheDocument();
    await expect.element(locators.next).not.toBeInTheDocument();
  });

  it('should not render when app is not loaded', async () => {
    await renderPager({isAppLoaded: false});

    await expect.element(locators.page1).not.toBeInTheDocument();
    await expect.element(locators.previous).not.toBeInTheDocument();
    await expect.element(locators.next).not.toBeInTheDocument();
  });

  it('should disable the previous button when there is no previous page', async () => {
    await renderPager({
      pagerState: {hasPreviousPage: false},
    });

    await expect.element(locators.previous).toHaveAttribute('disabled');
  });

  it('should disable the next button when there is no next page', async () => {
    await renderPager({
      pagerState: {hasNextPage: false},
    });

    await expect.element(locators.next).toHaveAttribute('disabled');
  });

  describe('when clicking on the previous button', () => {
    let focusSpy: MockInstance;
    let eventSpy: MockInstance;
    let previousSpy: MockInstance;

    beforeEach(async () => {
      const element = await renderPager({
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

    it('should call #focusOnFirstResultAfterNextSearch', async () => {
      expect(focusSpy).toHaveBeenCalled();
    });

    it("should dispatch 'atomic/scrollToTop'", async () => {
      expect(eventSpy).toHaveBeenCalledWith(
        new CustomEvent('atomic/scrollToTop')
      );
    });

    it('should call #pager.previousPage', async () => {
      expect(previousSpy).toHaveBeenCalled();
    });
  });

  describe('when clicking on the next button', () => {
    let focusSpy: MockInstance;
    let eventSpy: MockInstance;
    let nextSpy: MockInstance;

    beforeEach(async () => {
      const element = await renderPager({
        pagerState: {hasNextPage: true},
      });
      focusSpy = vi.spyOn(
        element.bindings.store.state.resultList!,
        'focusOnFirstResultAfterNextSearch'
      );
      eventSpy = vi.spyOn(element, 'dispatchEvent');
      nextSpy = vi.spyOn(element.pager, 'nextPage');

      await locators.next.click();
    });

    it('should call #focusOnFirstResultAfterNextSearch', async () => {
      expect(focusSpy).toHaveBeenCalled();
    });

    it("should dispatch 'atomic/scrollToTop'", async () => {
      expect(eventSpy).toHaveBeenCalledWith(
        new CustomEvent('atomic/scrollToTop')
      );
    });

    it('should call #pager.nextPage', async () => {
      expect(nextSpy).toHaveBeenCalled();
    });
  });

  describe('when clicking on a page button', () => {
    let focusSpy: MockInstance;
    let eventSpy: MockInstance;
    let selectPageSpy: MockInstance;

    beforeEach(async () => {
      const element = await renderPager({
        pagerState: {currentPages: [1, 2, 3, 4, 5]},
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

    it("should dispatch 'atomic/scrollToTop'", async () => {
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

  it('should be able to render a custom icon for the previous button', async () => {
    const icon = '<svg>random-previous-icon</svg>';
    const element = await renderPager({
      previousButtonIcon: icon,
    });

    const atomicIcon = element.shadowRoot?.querySelector(
      '[part="previous-button-icon"]'
    );
    expect(atomicIcon).toHaveAttribute('icon', icon);
  });

  it('should be able to render a custom icon for the next button', async () => {
    const icon = '<svg>random-next-icon</svg>';
    const element = await renderPager({
      nextButtonIcon: icon,
    });

    const atomicIcon = element.shadowRoot?.querySelector(
      '[part="next-button-icon"]'
    );
    expect(atomicIcon).toHaveAttribute('icon', icon);
  });

  it('should render all expected parts', async () => {
    const element = await renderPager();
    const parts = locators.parts(element);

    await expect.element(parts.buttons!).toBeInTheDocument();
    await expect.element(parts.pageButtons!).toBeInTheDocument();
    await expect.element(parts.pageButton!).toBeInTheDocument();
    await expect.element(parts.previousButton!).toBeInTheDocument();
    await expect.element(parts.nextButton!).toBeInTheDocument();
    await expect.element(parts.previousButtonIcon!).toBeInTheDocument();
    await expect.element(parts.nextButtonIcon!).toBeInTheDocument();
  });

  describe('when pager state changes', () => {
    it('should update currentPages when pager state changes', async () => {
      const element = await renderPager({
        pagerState: {currentPages: [6, 7, 8, 9, 10]},
      });

      expect(element.pagerState.currentPages).toEqual([6, 7, 8, 9, 10]);
    });

    it('should update hasPreviousPage when pager state changes', async () => {
      const element = await renderPager({
        pagerState: {hasPreviousPage: false},
      });

      expect(element.pagerState.hasPreviousPage).toBe(false);
    });

    it('should update hasNextPage when pager state changes', async () => {
      const element = await renderPager({
        pagerState: {hasNextPage: false},
      });

      expect(element.pagerState.hasNextPage).toBe(false);
    });
  });

  describe('when search status state changes', () => {
    it('should update hasError when search status changes', async () => {
      const element = await renderPager({
        searchStatusState: {hasError: true},
      });

      expect(element.searchStatusState.hasError).toBe(true);
    });

    it('should update hasResults when search status changes', async () => {
      const element = await renderPager({
        searchStatusState: {hasResults: false},
      });

      expect(element.searchStatusState.hasResults).toBe(false);
    });
  });

  describe('#validateProps', () => {
    it('should allow numberOfPages of 0', async () => {
      const consoleErrorSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      await renderPager({numberOfPages: 0});

      expect(consoleErrorSpy).not.toHaveBeenCalled();
    });

    it('should handle numberOfPages as string number', async () => {
      const element = await renderPager();

      element.setAttribute('number-of-pages', '8');
      await element.updateComplete;

      expect(element.numberOfPages).toBe(8);
    });

    it('should parse numberOfPages from mixed string-number input', async () => {
      const element = await renderPager();

      const mixedValue = parseInt('9k3', 10);
      element.numberOfPages = mixedValue;
      await element.updateComplete;

      expect(element.numberOfPages).toBe(9);
    });

    it('should handle invalid numberOfPages gracefully', async () => {
      const element = await renderPager();

      element.numberOfPages = -5;

      expect(() => {
        element['validateProps']();
      }).toThrow();
    });
  });

  describe('#focusOnFirstResultAndScrollToTop', () => {
    it('should call focusOnFirstResultAfterNextSearch and dispatch scrollToTop event', async () => {
      const element = await renderPager();
      const focusSpy = vi.spyOn(
        element.bindings.store.state.resultList!,
        'focusOnFirstResultAfterNextSearch'
      );
      const eventSpy = vi.spyOn(element, 'dispatchEvent');

      await element['focusOnFirstResultAndScrollToTop']();

      expect(focusSpy).toHaveBeenCalled();
      expect(eventSpy).toHaveBeenCalledWith(
        new CustomEvent('atomic/scrollToTop')
      );
    });
  });

  describe('when multiple rendering conditions are met', () => {
    beforeEach(async () => {
      await renderPager({
        searchStatusState: {hasError: false, hasResults: true},
        isAppLoaded: true,
      });
    });

    it('should render pager buttons', async () => {
      await expect.element(locators.page1).toBeInTheDocument();
      await expect.element(locators.previous).toBeInTheDocument();
      await expect.element(locators.next).toBeInTheDocument();
    });

    it('should render with proper ARIA labels', async () => {
      await expect
        .element(locators.page1)
        .toHaveAttribute('aria-label', 'Page 1');
      await expect
        .element(locators.previous)
        .toHaveAttribute('aria-label', 'Previous');
      await expect.element(locators.next).toHaveAttribute('aria-label', 'Next');
    });
  });
});

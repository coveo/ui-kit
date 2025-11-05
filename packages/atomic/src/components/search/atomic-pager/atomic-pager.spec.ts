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
    props = {},
    pagerState,
    searchStatusState,
    isAppLoaded = true,
  }: {
    props?: Partial<{
      numberOfPages: number;
      previousButtonIcon: string;
      nextButtonIcon: string;
    }>;
    pagerState?: Partial<PagerState>;
    searchStatusState?: Partial<SearchStatusState>;
    isAppLoaded?: boolean;
  } = {}) => {
    vi.mocked(buildPager).mockReturnValue(
      buildFakePager({state: pagerState || {}})
    );
    vi.mocked(buildSearchStatus).mockReturnValue(
      buildFakeSearchStatus(searchStatusState || {})
    );

    const {element} = await renderInAtomicSearchInterface<AtomicPager>({
      template: html`
        <atomic-pager
          number-of-pages=${ifDefined(props.numberOfPages)}
          previous-button-icon=${ifDefined(props.previousButtonIcon)}
          next-button-icon=${ifDefined(props.nextButtonIcon)}
        ></atomic-pager>
      `,
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

    element.isAppLoaded = isAppLoaded;

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

  it('should call buildPager with engine and numberOfPages option to set the pager', async () => {
    const element = await renderPager({props: {numberOfPages: 7}});
    const buildPagerMock = vi.mocked(buildPager);

    expect(buildPager).toHaveBeenCalledExactlyOnceWith(
      element.bindings.engine,
      {
        options: {numberOfPages: 7},
      }
    );
    expect(element.pager).toBe(buildPagerMock.mock.results[0].value);
  });

  it('should call buildSearchStatus with engine to set the search status', async () => {
    const element = await renderPager();
    const buildSearchStatusMock = vi.mocked(buildSearchStatus);

    expect(buildSearchStatus).toHaveBeenCalledExactlyOnceWith(
      element.bindings.engine
    );
    expect(element.searchStatus).toBe(
      buildSearchStatusMock.mock.results[0].value
    );
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

  // TODO: Fix dynamic numberOfPages property updates - https://coveord.atlassian.net/browse/KIT-5076
  it.skip('should update numberOfPages when property changes', async () => {
    const element = await renderPager({
      props: {numberOfPages: 3},
      pagerState: {currentPages: [1, 2, 3]},
    });
    expect(element.numberOfPages).toBe(3);

    element.numberOfPages = 7;
    await element.updateComplete;

    expect(element.numberOfPages).toBe(7);
    expect(buildPager).toHaveBeenCalledWith(element.bindings.engine, {
      options: {numberOfPages: 7},
    });
  });

  it.skip('should throw when numberOfPages property is set to invalid value', async () => {
    const element = await renderPager();

    expect(() => {
      element.numberOfPages = -1;
    }).toThrow();
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
    let focusOnFirstResultAfterNextSearchSpy: MockInstance;
    let dispatchEventSpy: MockInstance;
    let previousPageSpy: MockInstance;
    let announcePageLoaded: MockInstance;
    let element: AtomicPager;

    beforeEach(async () => {
      element = await renderPager({
        pagerState: {hasPreviousPage: true, currentPage: 2},
      });
      focusOnFirstResultAfterNextSearchSpy = vi.spyOn(
        element.bindings.store.state.resultList!,
        'focusOnFirstResultAfterNextSearch'
      );
      dispatchEventSpy = vi.spyOn(element, 'dispatchEvent');
      previousPageSpy = vi.spyOn(element.pager, 'previousPage');
      announcePageLoaded = vi.spyOn(element, 'announcePageLoaded');

      await locators.previous.click();
    });

    it('should call #focusOnFirstResultAfterNextSearch', async () => {
      expect(focusOnFirstResultAfterNextSearchSpy).toHaveBeenCalledOnce();
    });

    it("should dispatch an 'atomic/scrollToTop' custom event", async () => {
      expect(dispatchEventSpy).toHaveBeenCalledExactlyOnceWith(
        new CustomEvent('atomic/scrollToTop')
      );
    });

    it('should call #pager.previousPage', async () => {
      expect(previousPageSpy).toHaveBeenCalledOnce();
    });

    it('should announce page loaded with correct page number', async () => {
      expect(announcePageLoaded).toHaveBeenCalledOnce();
    });
  });

  it('should not disable the previous button when there is a previous page', async () => {
    await renderPager({
      pagerState: {hasPreviousPage: true},
    });

    await expect.element(locators.previous).not.toHaveAttribute('disabled');
  });

  describe('when clicking on the next button', () => {
    let focusSpy: MockInstance;
    let eventSpy: MockInstance;
    let nextSpy: MockInstance;
    let announcePageLoadedSpy: MockInstance;
    let element: AtomicPager;

    beforeEach(async () => {
      element = await renderPager({
        pagerState: {hasNextPage: true, currentPage: 1},
      });
      focusSpy = vi.spyOn(
        element.bindings.store.state.resultList!,
        'focusOnFirstResultAfterNextSearch'
      );
      eventSpy = vi.spyOn(element, 'dispatchEvent');
      nextSpy = vi.spyOn(element.pager, 'nextPage');
      announcePageLoadedSpy = vi.spyOn(element, 'announcePageLoaded');

      await locators.next.click();
    });

    it('should call #focusOnFirstResultAfterNextSearch', async () => {
      expect(focusSpy).toHaveBeenCalled();
    });

    it("should dispatch an 'atomic/scrollToTop' custom event", async () => {
      expect(eventSpy).toHaveBeenCalledWith(
        new CustomEvent('atomic/scrollToTop')
      );
    });

    it('should call #pager.nextPage', async () => {
      expect(nextSpy).toHaveBeenCalled();
    });

    it('should announce page loaded with correct page number', async () => {
      expect(announcePageLoadedSpy).toHaveBeenCalledOnce();
    });
  });

  it('should not be disabled when there is a next page', async () => {
    await renderPager({
      pagerState: {hasNextPage: true},
    });

    await expect.element(locators.next).not.toHaveAttribute('disabled');
  });

  describe('when clicking on a page button', () => {
    let focusSpy: MockInstance;
    let eventSpy: MockInstance;
    let selectPageSpy: MockInstance;
    let element: AtomicPager;

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

  it('should be able to render a custom icon for the previous button', async () => {
    const icon = '<svg>random-previous-icon</svg>';
    const element = await renderPager({
      props: {previousButtonIcon: icon},
    });

    const atomicIcon = element.shadowRoot?.querySelector(
      '[part="previous-button-icon"]'
    );
    expect(atomicIcon).toHaveAttribute('icon', icon);
  });

  it('should be able to render a custom icon for the next button', async () => {
    const icon = '<svg>random-next-icon</svg>';
    const element = await renderPager({
      props: {nextButtonIcon: icon},
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
      isAppLoaded: true,
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
    let element: AtomicCommercePager;

    beforeEach(async () => {
      element = await renderPager({state: {page: 2, totalPages: 10}});
    });

    const retrieveButtons = () => {
      return Array.from(
        element.shadowRoot?.querySelectorAll<HTMLInputElement>(
          'input[type="radio"]'
        ) || []
      );
    };

    const expectFocusOnButton = async (
      button: Element,
      expectedFocusButton: Element
    ) => {
      await expect.element(button).toBe(expectedFocusButton);
    };

    it('should focus on previous button when navigating backward from first page button', async () => {
      const buttons = retrieveButtons();

      const [firstPageButton, lastPageButton] = [
        buttons[0],
        buttons[buttons.length - 1],
      ];

      await element.handleFocus(buttons, firstPageButton, lastPageButton);

      await expectFocusOnButton(
        locators.previous.element(),
        document.activeElement?.shadowRoot?.activeElement
      );
    });

    it('should focus on next button when navigating forward from last page button', async () => {
      const buttons = retrieveButtons();

      const [firstPageButton, lastPageButton] = [
        buttons[0],
        buttons[buttons.length - 1],
      ];

      await element.handleFocus(buttons, lastPageButton, firstPageButton);

      await expectFocusOnButton(
        locators.next.element(),
        document.activeElement?.shadowRoot?.activeElement
      );
    });

    it('should focus on next page button when navigating between page buttons', async () => {
      const buttons = retrieveButtons();

      const [currentButton, nextButton] = buttons;

      await element.handleFocus(buttons, currentButton, nextButton);

      await expectFocusOnButton(
        locators.page2.element(),
        document.activeElement?.shadowRoot?.activeElement
      );
    });
  });
});

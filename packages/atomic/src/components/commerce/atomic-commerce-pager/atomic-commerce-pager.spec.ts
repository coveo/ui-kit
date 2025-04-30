import {buildFakePager} from '@/vitest-utils/headless/commerce/pager-subcontroller';
import {buildFakeProductListing} from '@/vitest-utils/headless/commerce/product-listing-controller';
import {buildFakeSearch} from '@/vitest-utils/headless/commerce/search-controller';
import {renderInAtomicCommerceInterface} from '@/vitest-utils/testing-helpers/fixtures/atomic/commerce/atomic-commerce-interface-fixture';
import {
  buildProductListing,
  buildSearch,
  PaginationState,
} from '@coveo/headless/commerce';
import {page} from '@vitest/browser/context';
import {html} from 'lit';
import {ifDefined} from 'lit/directives/if-defined.js';
import {describe, vi, expect, MockInstance} from 'vitest';
import {AtomicCommercePager} from './atomic-commerce-pager';
import './atomic-commerce-pager';

vi.mock('@coveo/headless/commerce', {spy: true});

describe('AtomicCommercePager', () => {
  const locators = {
    page1: page.getByLabelText('Page 1'),
    page2: page.getByLabelText('Page 2'),
    page3: page.getByLabelText('Page 3'),
    page4: page.getByLabelText('Page 4'),
    page5: page.getByLabelText('Page 5'),
    page6: page.getByLabelText('Page 6'),
    previous: page.getByLabelText('Previous'),
    next: page.getByLabelText('Next'),
    parts: (element: AtomicCommercePager) => {
      const qs = (part: string) =>
        element.shadowRoot?.querySelector(`[part="${part}"]`);
      return {
        buttons: qs('buttons'),
        pageButtons: qs('page-button'),
        pageButton: qs('page-button'),
        activePageButton: qs('page-button active-page-button'),
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
    interfaceType,
    state,
  }: {
    numberOfPages?: number;
    previousButtonIcon?: string;
    nextButtonIcon?: string;
    interfaceType?: 'product-listing' | 'search';
    state?: Partial<PaginationState>;
  } = {}) => {
    const mockedPager = vi.fn().mockReturnValue(buildFakePager({state}));
    vi.mocked(buildProductListing).mockReturnValue(
      buildFakeProductListing({
        implementation: {
          pagination: mockedPager,
        },
      })
    );
    vi.mocked(buildSearch).mockReturnValue(
      buildFakeSearch({
        implementation: {
          pagination: mockedPager,
        },
      })
    );

    const {element} =
      await renderInAtomicCommerceInterface<AtomicCommercePager>({
        template: html`<atomic-commerce-pager
          number-of-pages=${ifDefined(numberOfPages)}
          previous-button-icon=${ifDefined(previousButtonIcon)}
          next-button-icon=${ifDefined(nextButtonIcon)}
        ></atomic-commerce-pager>`,
        selector: 'atomic-commerce-pager',
        bindings: (bindings) => {
          bindings.interfaceElement.type = interfaceType ?? 'product-listing';
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

  test('should call buildProductListing with engine when interfaceElement.type is product-listing', async () => {
    const element = await renderPager({
      interfaceType: 'product-listing',
    });

    expect(buildProductListing).toHaveBeenCalledWith(element.bindings.engine);
    expect(element.pager).toBeDefined();
  });

  test('should call buildSearch with engine when interfaceElement.type is search', async () => {
    const element = await renderPager({
      interfaceType: 'search',
    });

    expect(buildSearch).toHaveBeenCalledWith(element.bindings.engine);
    expect(element.pager).toBeDefined();
  });

  test('should show the proper page range by default', async () => {
    await renderPager();

    await expect.element(locators.page1).toBeInTheDocument();
    await expect.element(locators.page2).toBeInTheDocument();
    await expect.element(locators.page3).toBeInTheDocument();
    await expect.element(locators.page4).toBeInTheDocument();
    await expect.element(locators.page5).toBeInTheDocument();
    await expect.element(locators.page6).not.toBeInTheDocument();
  });

  test('number-of-pages should affect the range of pages', async () => {
    await renderPager({numberOfPages: 3});

    await expect.element(locators.page1).toBeInTheDocument();
    await expect.element(locators.page2).toBeInTheDocument();
    await expect.element(locators.page3).toBeInTheDocument();
    await expect.element(locators.page4).not.toBeInTheDocument();
  });

  test('should throw an error when numberOfPages is less than 0', async () => {
    const consoleErrorSpy = vi.spyOn(console, 'error');
    const element = await renderPager({numberOfPages: -1});

    expect(consoleErrorSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        message: expect.stringContaining(
          'numberOfPages: minimum value of 0 not respected'
        ),
      }),
      element
    );
  });

  test('should not render when there are no pages', async () => {
    await renderPager({state: {totalPages: 0}});

    await expect.element(locators.page1).not.toBeInTheDocument();
  });

  test('should not render when there is only 1 page', async () => {
    await renderPager({state: {totalPages: 1}});

    await expect.element(locators.page1).not.toBeInTheDocument();
  });

  test('should disable the previous button when on the first page', async () => {
    await renderPager();

    await expect.element(locators.previous).toHaveAttribute('disabled');
  });

  test('should disable the next button when on the last page', async () => {
    await renderPager({state: {page: 9, totalPages: 10}});

    await expect.element(locators.next).toHaveAttribute('disabled');
  });

  describe('when clicking on the previous button', () => {
    let focusSpy: MockInstance;
    let eventSpy: MockInstance;
    let previousSpy: MockInstance;

    beforeEach(async () => {
      const element = await renderPager({state: {page: 2}});
      focusSpy = vi.spyOn(
        element.bindings.store.state.resultList!,
        'focusOnFirstResultAfterNextSearch'
      );
      eventSpy = vi.spyOn(element, 'dispatchEvent');
      previousSpy = vi.spyOn(element.pager, 'previousPage');

      await locators.previous.click();
    });

    test('should call #focusOnFirstResultAfterNextSearch', async () => {
      expect(focusSpy).toHaveBeenCalled();
    });

    test("should dispatch 'atomic/scrollToTop'", async () => {
      expect(eventSpy).toHaveBeenCalledWith(
        new CustomEvent('atomic/scrollToTop')
      );
    });

    test('should call #pager.previousPage', async () => {
      expect(previousSpy).toHaveBeenCalled();
    });
  });

  describe('when clicking on the next button', () => {
    let focusSpy: MockInstance;
    let eventSpy: MockInstance;
    let nextSpy: MockInstance;

    beforeEach(async () => {
      const element = await renderPager({state: {page: 2}});
      focusSpy = vi.spyOn(
        element.bindings.store.state.resultList!,
        'focusOnFirstResultAfterNextSearch'
      );
      eventSpy = vi.spyOn(element, 'dispatchEvent');
      nextSpy = vi.spyOn(element.pager, 'nextPage');

      await locators.next.click();
    });

    test('should call #focusOnFirstResultAfterNextSearch', async () => {
      expect(focusSpy).toHaveBeenCalled();
    });

    test("should dispatch 'atomic/scrollToTop'", async () => {
      expect(eventSpy).toHaveBeenCalledWith(
        new CustomEvent('atomic/scrollToTop')
      );
    });

    test('should call #pager.nextPage', async () => {
      expect(nextSpy).toHaveBeenCalled();
    });
  });

  describe('when clicking on a page button', () => {
    let focusSpy: MockInstance;
    let eventSpy: MockInstance;
    let selectPageSpy: MockInstance;

    beforeEach(async () => {
      const element = await renderPager();
      focusSpy = vi.spyOn(
        element.bindings.store.state.resultList!,
        'focusOnFirstResultAfterNextSearch'
      );
      eventSpy = vi.spyOn(element, 'dispatchEvent');
      selectPageSpy = vi.spyOn(element.pager, 'selectPage');
      await locators.page3.click();
    });

    test('should call #focusOnFirstResultAfterNextSearch', async () => {
      expect(focusSpy).toHaveBeenCalled();
    });

    test("should dispatch 'atomic/scrollToTop'", async () => {
      expect(eventSpy).toHaveBeenCalledWith(
        new CustomEvent('atomic/scrollToTop')
      );
    });

    test('should call #pager.selectPage', async () => {
      expect(selectPageSpy).toHaveBeenCalled();
    });
  });

  test('should render the proper value on the page buttons', async () => {
    await renderPager();

    await expect.element(locators.page1).toHaveAttribute('value', '1');
    await expect.element(locators.page2).toHaveAttribute('value', '2');
    await expect.element(locators.page3).toHaveAttribute('value', '3');
  });

  test('should have the selected button as active', async () => {
    await renderPager();

    await expect
      .element(locators.page1)
      .toHaveAttribute('part', 'page-button active-page-button');
    await expect.element(locators.page2).toHaveAttribute('part', 'page-button');
  });

  test('should be able to render a custom icon for the previous button', async () => {
    const icon = '<svg>random-previous-icon</svg>';
    const element = await renderPager({
      previousButtonIcon: icon,
    });

    const atomicIcon = element.shadowRoot?.querySelector(
      '[part="previous-button-icon"]'
    );
    expect(atomicIcon).toHaveAttribute('icon', icon);
  });

  test('should be able to render a custom icon for the next button', async () => {
    const icon = '<svg>random-next-icon</svg>';
    const element = await renderPager({
      nextButtonIcon: icon,
    });

    const atomicIcon = element.shadowRoot?.querySelector(
      '[part="next-button-icon"]'
    );
    expect(atomicIcon).toHaveAttribute('icon', icon);
  });

  test('should render every part', async () => {
    const element = await renderPager();

    const parts = locators.parts(element);

    await expect.element(parts.buttons!).toBeInTheDocument();
    await expect.element(parts.pageButtons!).toBeInTheDocument();
    await expect.element(parts.pageButton!).toBeInTheDocument();
    await expect.element(parts.activePageButton!).toBeInTheDocument();
    await expect.element(parts.previousButton!).toBeInTheDocument();
    await expect.element(parts.nextButton!).toBeInTheDocument();
    await expect.element(parts.previousButtonIcon!).toBeInTheDocument();
    await expect.element(parts.nextButtonIcon!).toBeInTheDocument();
  }, 1e60);
});

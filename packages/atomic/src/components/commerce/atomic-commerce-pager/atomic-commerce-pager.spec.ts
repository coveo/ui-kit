import {createTestI18n} from '@/vitest-utils/i18n-utils';
import {PaginationState} from '@coveo/headless/commerce';
import * as headless from '@coveo/headless/commerce';
import {page} from '@vitest/browser/context';
import '@vitest/browser/matchers.d.ts';
import {describe, test, vi, expect, beforeEach, afterEach} from 'vitest';
import {CommerceBindings} from '../atomic-commerce-interface/atomic-commerce-interface';
import {CommerceStore} from '../atomic-commerce-interface/store';
import './atomic-commerce-pager';
import {AtomicCommercePager} from './atomic-commerce-pager';

vi.mock('@coveo/headless/commerce', () => {
  return {
    buildProductListing: vi.fn(() => {
      return {
        pagination: vi.fn(() => ({
          previousPage: vi.fn(),
          selectPage: vi.fn(),
          nextPage: vi.fn(),
        })),
      };
    }),
    buildSearch: vi.fn(() => {
      return {
        pagination: vi.fn(() => ({
          previousPage: vi.fn(),
          selectPage: vi.fn(),
          nextPage: vi.fn(),
        })),
      };
    }),
  };
});

// Retry the render from Lit instead of append body
describe('AtomicCommercePager', () => {
  let element: AtomicCommercePager;

  describe('when initializing', () => {
    beforeEach(async () => {
      element = await renderPager();
    });

    afterEach(() => {
      cleanBody();
    });

    test('should validate props', () => {
      const validatePropsSpy = vi.spyOn(element, 'validateProps');
      element.initialize();
      expect(validatePropsSpy).toHaveBeenCalled();
    });

    test('should call buildProductListing with engine when interfaceElement.type is product-listing', () => {
      const buildProductListingMock = vi.spyOn(headless, 'buildProductListing');
      element.bindings.interfaceElement.type = 'product-listing';

      element.initialize();

      expect(buildProductListingMock).toHaveBeenCalledWith(
        element.bindings.engine
      );
    });

    test('should call buildSearch with engine when interfaceElement.type is search', () => {
      const buildSearchMock = vi.spyOn(headless, 'buildSearch');
      element.bindings.interfaceElement.type = 'search';

      element.initialize();

      expect(buildSearchMock).toHaveBeenCalledWith(element.bindings.engine);
    });
  });

  describe('when rendering', () => {
    afterEach(() => {
      cleanBody();
    });

    test('should show the proper page range by default', async () => {
      element = await renderPager();

      await expect.element(page.getByLabelText('Page 1')).toBeInTheDocument();
      await expect.element(page.getByLabelText('Page 2')).toBeInTheDocument();
      await expect.element(page.getByLabelText('Page 3')).toBeInTheDocument();
      await expect.element(page.getByLabelText('Page 4')).toBeInTheDocument();
      await expect.element(page.getByLabelText('Page 5')).toBeInTheDocument();
      await expect
        .element(page.getByLabelText('Page 6'))
        .not.toBeInTheDocument();
    });

    test('number-of-pages should affect the range of pages', async () => {
      element = await renderPager({numberOfPages: 3});

      await expect.element(page.getByLabelText('Page 1')).toBeInTheDocument();
      await expect.element(page.getByLabelText('Page 2')).toBeInTheDocument();
      await expect.element(page.getByLabelText('Page 3')).toBeInTheDocument();
      await expect
        .element(page.getByLabelText('Page 4'))
        .not.toBeInTheDocument();
    });

    test('should throw an error when numberOfPages is less than 0', async () => {
      await expect(renderPager({numberOfPages: -1})).rejects.toThrowError(
        'numberOfPages: minimum value of 0 not respected'
      );
    });

    //Cant do for now need atomic-icon
    test.skip('previous-button-icon should render the proper icon', async () => {
      element = await renderPager();
    });

    //Cant do for now need atomic-icon
    test.skip('next-button-icon should render the proper icon', async () => {
      element = await renderPager();
    });

    test('should not render when there are no pages', async () => {
      element = await renderPager({
        mockedState: {totalPages: 0, page: 0, pageSize: 10, totalEntries: 0},
      });

      await expect
        .element(page.getByLabelText('Page 1'))
        .not.toBeInTheDocument();
    });

    test('should disable the previous button when on the first page', async () => {
      element = await renderPager();

      await expect
        .element(page.getByLabelText('Previous'))
        .toHaveAttribute('disabled');
    });

    test('should disable the next button when on the last page', async () => {
      element = await renderPager({
        mockedState: {page: 9, totalPages: 10, pageSize: 10, totalEntries: 100},
      });

      await expect
        .element(page.getByLabelText('Next'))
        .toHaveAttribute('disabled');
    });

    test('should call focusOnFirstResultAndScrollToTop and dispatch atomic/scrollToTop when clicking on the previous button', async () => {
      element = await renderPager({
        mockedState: {
          page: 2,
          totalPages: 10,
          pageSize: 10,
          totalEntries: 100,
        },
      });
      const focusSpy = vi.spyOn(
        element as never,
        'focusOnFirstResultAndScrollToTop'
      );
      const eventSpy = vi.spyOn(element, 'dispatchEvent');

      await page.getByLabelText('Previous').click();

      expect(focusSpy).toHaveBeenCalled();
      expect(eventSpy).toHaveBeenCalledWith(
        new CustomEvent('atomic/scrollToTop')
      );
    });

    test('should call previousPage when clicking on the previous button', async () => {
      element = await renderPager({
        mockedState: {
          page: 2,
          totalPages: 10,
          pageSize: 10,
          totalEntries: 100,
        },
      });
      const previousPageSpy = vi.spyOn(element.pager, 'previousPage');
      const eventSpy = vi.spyOn(element, 'dispatchEvent');

      await page.getByLabelText('Previous').click();

      expect(previousPageSpy).toHaveBeenCalled();
      expect(eventSpy).toHaveBeenCalledWith(
        new CustomEvent('atomic/scrollToTop')
      );
    });

    test('should call focusOnFirstResultAndScrollToTop and dispatch atomic/scrollToTop when clicking on the next button', async () => {
      element = await renderPager({
        mockedState: {
          page: 2,
          totalPages: 10,
          pageSize: 10,
          totalEntries: 100,
        },
      });
      const focusSpy = vi.spyOn(
        element as never,
        'focusOnFirstResultAndScrollToTop'
      );
      const eventSpy = vi.spyOn(element, 'dispatchEvent');

      await page.getByLabelText('Next').click();

      expect(focusSpy).toHaveBeenCalled;
      expect(eventSpy).toHaveBeenCalledWith(
        new CustomEvent('atomic/scrollToTop')
      );
    });

    test('should call nextPage when clicking on the next button', async () => {
      element = await renderPager({
        mockedState: {
          page: 2,
          totalPages: 10,
          pageSize: 10,
          totalEntries: 100,
        },
      });
      const nextPageSpy = vi.spyOn(element.pager, 'nextPage');

      await page.getByLabelText('Next').click();

      expect(nextPageSpy).toHaveBeenCalled();
    });

    test('should call focusOnFirstResultAndScrollToTop and dispatch atomic/scrollToTop when clicking on a page button', async () => {
      element = await renderPager();
      const focusSpy = vi.spyOn(
        element as never,
        'focusOnFirstResultAndScrollToTop'
      );

      await page.getByLabelText('Page 2').click();

      expect(focusSpy).toHaveBeenCalled();
    });

    test('should call selectPage when clicking on a page button', async () => {
      element = await renderPager();
      const selectPageSpy = vi.spyOn(element.pager, 'selectPage');

      await page.getByLabelText('Page 2').click();

      expect(selectPageSpy).toHaveBeenCalled();
    });

    test('should render the proper value on the page buttons', async () => {
      element = await renderPager();

      await expect
        .element(page.getByLabelText('Page 1'))
        .toHaveAttribute('value', '1');
      await expect
        .element(page.getByLabelText('Page 2'))
        .toHaveAttribute('value', '2');
      await expect
        .element(page.getByLabelText('Page 3'))
        .toHaveAttribute('value', '3');
    });

    test('should have the selected button as active', async () => {
      element = await renderPager();

      await expect
        .element(page.getByLabelText('Page 1'))
        .toHaveAttribute('part', 'page-button active-page-button');
      await expect
        .element(page.getByLabelText('Page 2'))
        .toHaveAttribute('part', 'page-button');
    });
  });
});

async function renderPager({
  numberOfPages,
  mockedState = {
    page: 0,
    totalPages: 10,
    pageSize: 10,
    totalEntries: 100,
  },
}: {numberOfPages?: number; mockedState?: PaginationState} = {}) {
  const pager = document.createElement(
    'atomic-commerce-pager'
  ) as AtomicCommercePager;

  if (numberOfPages !== undefined) {
    pager.setAttribute('number-of-pages', numberOfPages.toString());
  }

  document.body.appendChild(pager);

  await addMockedState(pager, mockedState);
  await addMockedBindings(pager);
  //@ts-expect-error - manually setting up this private property since a mocked implementation of createAppLoadedListener created problems. Couldn't manage keeping it to true when I needed it.
  pager.isAppLoaded = true;
  pager.initialize();

  return pager;
}

async function addMockedBindings(element: AtomicCommercePager) {
  const i18nTest = await createTestI18n();
  element.bindings = {
    store: {
      state: {
        resultList: {
          focusOnFirstResultAfterNextSearch: () => {},
        },
      },
    } as CommerceStore,
    i18n: i18nTest,
    interfaceElement: {
      type: 'product-listing',
    } as HTMLAtomicCommerceInterfaceElement,
  } as CommerceBindings;
}

async function addMockedState(
  element: AtomicCommercePager,
  state: PaginationState
) {
  element.pagerState = state;
}

function cleanBody() {
  document.body.innerHTML = '';
}

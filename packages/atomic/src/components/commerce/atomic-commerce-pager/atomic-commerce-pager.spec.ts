import {createTestI18n} from '@/vitest-utils/i18n-utils';
import {fixture} from '@/vitest-utils/testing-helpers/fixture';
import * as headless from '@coveo/headless/commerce';
import {page} from '@vitest/browser/context';
import '@vitest/browser/matchers.d.ts';
import {html} from 'lit';
import {describe, test, vi, expect, beforeEach, afterEach} from 'vitest';
import {createAppLoadedListener} from '../../common/interface/store';
import './atomic-commerce-pager';
import {AtomicCommercePager} from './atomic-commerce-pager';

let mocks = await vi.hoisted(async () => {
  const mockFactory = await import('./spec-mocks');
  return mockFactory.default;
});

vi.mock('@/src/components/common/interface/store', () => ({
  createAppLoadedListener: vi.fn((_, callback) => {
    callback(true);
  }),
}));

vi.mock('@/src/decorators/error-guard', () => ({
  errorGuard: vi.fn(),
}));

vi.mock('@/src/decorators/binding-guard', () => ({
  bindingGuard: vi.fn(),
}));

vi.mock('@/src/utils/utils', () => ({
  randomID: vi.fn(),
}));

vi.mock('@/src/decorators/bind-state', async () => {
  return {
    bindStateToController: vi.fn(() => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return (proto: any, stateProperty: string) => {
        Object.defineProperty(proto, stateProperty, {
          get() {
            return mocks[stateProperty as keyof typeof mocks];
          },
        });
      };
    }),
  };
});

const i18n = await createTestI18n();
vi.mock('@/src/mixins/bindings-mixin', () => ({
  InitializeBindingsMixin: vi.fn().mockImplementation((superClass) => {
    return class extends superClass {
      constructor(...args: unknown[]) {
        super(...args);
        this.bindings = {
          store: {
            state: {
              resultList: {
                focusOnFirstResultAfterNextSearch: () => {},
              },
            },
          },
          interfaceElement: {
            type: 'product-listing',
          },
          i18n,
        };
        this.pager = mocks.pager;
      }
    };
  }),
  BindingController: class {},
}));

vi.mock('@coveo/headless/commerce', () => {
  return {
    buildProductListing: mocks.listing,
    buildSearch: mocks.search,
  };
});

describe('AtomicCommercePager', () => {
  beforeEach(async () => {
    mocks = (await import('./spec-mocks')).default;
  });

  let element: AtomicCommercePager;

  const setupElement = async ({
    numberOfPages,
  }: {numberOfPages?: number} = {}) => {
    const element = await fixture<AtomicCommercePager>(
      html`<atomic-commerce-pager></atomic-commerce-pager>`
    );

    if (numberOfPages !== undefined) {
      element.setAttribute('number-of-pages', numberOfPages.toString());
    }

    element.initialize();

    return element;
  };

  describe('when initializing', () => {
    beforeEach(async () => {
      element = await setupElement();
    });

    test('should validate props', () => {
      const validatePropsSpy = vi.spyOn(element as never, 'validateProps');
      element.initialize();
      expect(validatePropsSpy).toHaveBeenCalled();
    });

    test('should call buildProductListing with engine when interfaceElement.type is product-listing', () => {
      const paginationMock = {id: 'pager  listing'};
      const buildProductListingMock = vi
        .spyOn(headless, 'buildProductListing')
        .mockReturnValue({pagination: vi.fn(() => paginationMock)} as never);
      element.bindings.interfaceElement.type = 'product-listing';

      element.initialize();

      expect(buildProductListingMock).toHaveBeenCalledWith(
        element.bindings.engine
      );
      expect(element.pager).toBe(paginationMock);
    });

    test('should call buildSearch with engine when interfaceElement.type is search', () => {
      const paginationMock = {id: 'pager search'};
      const buildSearchMock = vi
        .spyOn(headless, 'buildSearch')
        .mockReturnValue({
          pagination: vi.fn(() => paginationMock),
        } as never);
      element.bindings.interfaceElement.type = 'search';

      element.initialize();

      expect(buildSearchMock).toHaveBeenCalledWith(element.bindings.engine);
      expect(element.pager).toBe(paginationMock);
    });

    test('should call createAppLoadedListener with store and function', () => {
      element.initialize();

      expect(createAppLoadedListener).toHaveBeenCalledWith(
        element.bindings.store,
        expect.any(Function)
      );
    });
  });

  describe('when rendering', () => {
    const locators = {
      page1: page.getByLabelText('Page 1'),
      page2: page.getByLabelText('Page 2'),
      page3: page.getByLabelText('Page 3'),
      page4: page.getByLabelText('Page 4'),
      page5: page.getByLabelText('Page 5'),
      page6: page.getByLabelText('Page 6'),
      previous: page.getByLabelText('Previous'),
      next: page.getByLabelText('Next'),
    };

    afterEach(() => {
      mocks.pagerState = {
        page: 0,
        totalPages: 10,
        pageSize: 10,
        totalEntries: 100,
      };
    });

    test('should show the proper page range by default', async () => {
      await setupElement();

      await expect.element(locators.page1).toBeInTheDocument();
      await expect.element(locators.page2).toBeInTheDocument();
      await expect.element(locators.page3).toBeInTheDocument();
      await expect.element(locators.page4).toBeInTheDocument();
      await expect.element(locators.page5).toBeInTheDocument();
      await expect.element(locators.page6).not.toBeInTheDocument();
    });

    test('number-of-pages should affect the range of pages', async () => {
      await setupElement({numberOfPages: 3});

      await expect.element(locators.page1).toBeInTheDocument();
      await expect.element(locators.page2).toBeInTheDocument();
      await expect.element(locators.page3).toBeInTheDocument();
      await expect.element(locators.page4).not.toBeInTheDocument();
    });

    test('should throw an error when numberOfPages is less than 0', async () => {
      await expect(setupElement({numberOfPages: -1})).rejects.toThrowError(
        'numberOfPages: minimum value of 0 not respected'
      );
    });

    test('should not render when there are no pages', async () => {
      mocks.pagerState.totalPages = 0;

      await expect.element(locators.page1).not.toBeInTheDocument();
    });

    test('should not render when there is only 1 page', async () => {
      mocks.pagerState.totalPages = 0;

      await expect.element(locators.page1).not.toBeInTheDocument();
    });

    test('should disable the previous button when on the first page', async () => {
      await setupElement();

      await expect.element(locators.previous).toHaveAttribute('disabled');
    });

    test('should disable the next button when on the last page', async () => {
      mocks.pagerState.page = 9;
      mocks.pagerState.totalPages = 10;
      await setupElement();

      await expect.element(locators.next).toHaveAttribute('disabled');
    });

    test('should call focusOnFirstResultAndScrollToTop and dispatch atomic/scrollToTop when clicking on the previous button', async () => {
      mocks.pagerState.page = 2;
      element = await setupElement();
      const focusSpy = vi.spyOn(
        element as never,
        'focusOnFirstResultAndScrollToTop'
      );
      const eventSpy = vi.spyOn(element, 'dispatchEvent');

      await locators.previous.click();

      expect(focusSpy).toHaveBeenCalled();
      expect(eventSpy).toHaveBeenCalledWith(
        new CustomEvent('atomic/scrollToTop')
      );
    });

    test('should call previousPage when clicking on the previous button', async () => {
      mocks.pagerState.page = 2;
      element = await setupElement();
      element.pager.previousPage = vi.fn();
      const previousPageSpy = vi.spyOn(element.pager, 'previousPage');
      const eventSpy = vi.spyOn(element, 'dispatchEvent');

      await locators.previous.click();

      expect(previousPageSpy).toHaveBeenCalled();
      expect(eventSpy).toHaveBeenCalledWith(
        new CustomEvent('atomic/scrollToTop')
      );
    });

    test('should call focusOnFirstResultAndScrollToTop and dispatch atomic/scrollToTop when clicking on the next button', async () => {
      mocks.pagerState.page = 2;
      element = await setupElement();
      const focusSpy = vi.spyOn(
        element as never,
        'focusOnFirstResultAndScrollToTop'
      );
      const eventSpy = vi.spyOn(element, 'dispatchEvent');

      await locators.next.click();

      expect(focusSpy).toHaveBeenCalled();
      expect(eventSpy).toHaveBeenCalledWith(
        new CustomEvent('atomic/scrollToTop')
      );
    });

    test('should call nextPage when clicking on the next button', async () => {
      mocks.pagerState.page = 2;
      element = await setupElement();
      const nextPageSpy = vi.spyOn(element.pager, 'nextPage');

      await locators.next.click();

      expect(nextPageSpy).toHaveBeenCalled();
    });

    test('should call focusOnFirstResultAndScrollToTop and dispatch atomic/scrollToTop when clicking on a page button', async () => {
      element = await setupElement();
      const focusSpy = vi.spyOn(
        element as never,
        'focusOnFirstResultAndScrollToTop'
      );

      await locators.page2.click();

      expect(focusSpy).toHaveBeenCalled();
    });

    test('should call selectPage when clicking on a page button', async () => {
      element = await setupElement();
      const selectPageSpy = vi.spyOn(element.pager, 'selectPage');

      await locators.page2.click();

      expect(selectPageSpy).toHaveBeenCalled();
    });

    test('should render the proper value on the page buttons', async () => {
      await setupElement();

      await expect.element(locators.page1).toHaveAttribute('value', '1');
      await expect.element(locators.page2).toHaveAttribute('value', '2');
      await expect.element(locators.page3).toHaveAttribute('value', '3');
    });

    test('should have the selected button as active', async () => {
      await setupElement();

      await expect
        .element(locators.page1)
        .toHaveAttribute('part', 'page-button active-page-button');
      await expect
        .element(locators.page2)
        .toHaveAttribute('part', 'page-button');
    });
  });
});

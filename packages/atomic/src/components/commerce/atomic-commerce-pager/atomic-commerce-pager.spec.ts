import {
  buildProductListing,
  buildSearch,
  type PaginationState,
} from '@coveo/headless/commerce';
import {html} from 'lit';
import {ifDefined} from 'lit/directives/if-defined.js';
import {beforeEach, describe, expect, it, type MockInstance, vi} from 'vitest';
import {page} from 'vitest/browser';
import {renderInAtomicCommerceInterface} from '@/vitest-utils/testing-helpers/fixtures/atomic/commerce/atomic-commerce-interface-fixture';
import {buildFakePager} from '@/vitest-utils/testing-helpers/fixtures/headless/commerce/pager-subcontroller';
import {buildFakeProductListing} from '@/vitest-utils/testing-helpers/fixtures/headless/commerce/product-listing-controller';
import {buildFakeSearch} from '@/vitest-utils/testing-helpers/fixtures/headless/commerce/search-controller';
import type {AtomicCommercePager} from './atomic-commerce-pager';
import './atomic-commerce-pager';

vi.mock('@coveo/headless/commerce', {spy: true});

describe('atomic-commerce-pager', () => {
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
        template: html`
          <atomic-commerce-pager
            number-of-pages=${ifDefined(numberOfPages)}
            previous-button-icon=${ifDefined(previousButtonIcon)}
            next-button-icon=${ifDefined(nextButtonIcon)}
          ></atomic-commerce-pager>
        `,
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

  it('should call buildProductListing with engine when interfaceElement.type is product-listing', async () => {
    const element = await renderPager({
      interfaceType: 'product-listing',
    });

    expect(buildProductListing).toHaveBeenCalledWith(element.bindings.engine);
    expect(element.pager).toBeDefined();
  });

  it('should call buildSearch with engine when interfaceElement.type is search', async () => {
    const element = await renderPager({
      interfaceType: 'search',
    });

    expect(buildSearch).toHaveBeenCalledWith(element.bindings.engine);
    expect(element.pager).toBeDefined();
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

  it('number-of-pages should affect the range of pages', async () => {
    await renderPager({numberOfPages: 3});

    await expect.element(locators.page1).toBeInTheDocument();
    await expect.element(locators.page2).toBeInTheDocument();
    await expect.element(locators.page3).toBeInTheDocument();
    await expect.element(locators.page4).not.toBeInTheDocument();
  });

  it('should throw an error when numberOfPages is less than 0', async () => {
    const consoleErrorSpy = vi
      .spyOn(console, 'error')
      .mockImplementation(() => {});
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

  it('should not render when there are no pages', async () => {
    await renderPager({state: {totalPages: 0}});

    await expect.element(locators.page1).not.toBeInTheDocument();
  });

  it('should not render when there is only 1 page', async () => {
    await renderPager({state: {totalPages: 1}});

    await expect.element(locators.page1).not.toBeInTheDocument();
  });

  it('should disable the previous button when on the first page', async () => {
    await renderPager();

    await expect.element(locators.previous).toHaveAttribute('disabled');
  });

  it('should disable the next button when on the last page', async () => {
    await renderPager({state: {page: 9, totalPages: 10}});

    await expect.element(locators.next).toHaveAttribute('disabled');
  });

  describe('when clicking on the previous button', () => {
    let focusSpy: MockInstance;
    let eventSpy: MockInstance;
    let previousSpy: MockInstance;
    let announcePageLoaded: MockInstance;

    beforeEach(async () => {
      const element = await renderPager({state: {page: 2}});
      focusSpy = vi.spyOn(
        element.bindings.store.state.resultList!,
        'focusOnFirstResultAfterNextSearch'
      );
      eventSpy = vi.spyOn(element, 'dispatchEvent');
      previousSpy = vi.spyOn(element.pager, 'previousPage');
      announcePageLoaded = vi.spyOn(element, 'announcePageLoaded');

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

    it('should announce page loaded with correct page number', async () => {
      expect(announcePageLoaded).toHaveBeenCalledOnce();
    });
  });

  describe('when clicking on the next button', () => {
    let focusSpy: MockInstance;
    let eventSpy: MockInstance;
    let nextSpy: MockInstance;
    let announcePageLoadedSpy: MockInstance;

    beforeEach(async () => {
      const element = await renderPager({state: {page: 2}});
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

    it("should dispatch 'atomic/scrollToTop'", async () => {
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

    it('should call #focusOnFirstResultAfterNextSearch', async () => {
      expect(focusSpy).toHaveBeenCalled();
    });

    it("should dispatch 'atomic/scrollToTop'", async () => {
      expect(eventSpy).toHaveBeenCalledWith(
        new CustomEvent('atomic/scrollToTop')
      );
    });

    it('should call #pager.selectPage', async () => {
      expect(selectPageSpy).toHaveBeenCalled();
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
      .toHaveAttribute('part', 'page-button active-page-button');
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

  it('should render every part', async () => {
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

  it('should use keyed directive for page buttons', async () => {
    await renderPager();

    await expect.element(locators.page1).toHaveAttribute('value', '1');
    await expect.element(locators.page2).toHaveAttribute('value', '2');
    await expect.element(locators.page3).toHaveAttribute('value', '3');
  });

  describe('accessibility and focus', () => {
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

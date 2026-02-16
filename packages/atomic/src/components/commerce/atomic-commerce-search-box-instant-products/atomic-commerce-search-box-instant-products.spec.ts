import {buildInstantProducts} from '@coveo/headless/commerce';
import {html} from 'lit';
import {
  beforeEach,
  describe,
  expect,
  it,
  type MockedObject,
  type MockInstance,
  vi,
} from 'vitest';
import {page} from 'vitest/browser';
import type {
  SearchBoxSuggestionElement,
  SearchBoxSuggestions,
} from '@/src/components/common/suggestions/suggestions-types';
import {buildCustomEvent} from '@/src/utils/event-utils';
import {fixture} from '@/vitest-utils/testing-helpers/fixture';
import {
  defaultBindings,
  renderInAtomicCommerceSearchBox,
} from '@/vitest-utils/testing-helpers/fixtures/atomic/commerce/atomic-commerce-search-box-fixture';
import {buildFakeInstantProducts} from '@/vitest-utils/testing-helpers/fixtures/headless/commerce/instant-products-controller';
import {mockConsole} from '@/vitest-utils/testing-helpers/testing-utils/mock-console';
import {AtomicCommerceSearchBoxInstantProducts} from './atomic-commerce-search-box-instant-products';
import './atomic-commerce-search-box-instant-products';

vi.mock('@coveo/headless/commerce', {spy: true});

describe('atomic-commerce-search-box-instant-products', () => {
  let mockedConsole: MockedObject<Console>;

  beforeEach(() => {
    mockedConsole = mockConsole();
    vi.mocked(buildInstantProducts).mockReturnValue(buildFakeInstantProducts());
  });
  const renderElements = async (bindings: Record<string, unknown> = {}) => {
    const {element, searchBox} =
      await renderInAtomicCommerceSearchBox<AtomicCommerceSearchBoxInstantProducts>(
        {
          template: html`<atomic-commerce-search-box-instant-products></atomic-commerce-search-box-instant-products>`,
          selector: 'atomic-commerce-search-box-instant-products',
          bindings: {
            ...bindings,
          },
        }
      );
    return {element, searchBox};
  };

  describe('when outside of a search box', () => {
    let element: AtomicCommerceSearchBoxInstantProducts;

    beforeEach(async () => {
      element = await fixture<AtomicCommerceSearchBoxInstantProducts>(
        html`<atomic-commerce-search-box-instant-products></atomic-commerce-search-box-instant-products>`
      );
    });

    it('should log an error in the console', async () => {
      expect(mockedConsole.error).toHaveBeenCalledWith(
        new Error(
          'The "atomic-commerce-search-box-instant-products" component was not handled, as it is not a child of the following elements: atomic-commerce-search-box'
        ),
        element
      );
    });

    it('should display an error component', async () => {
      await expect
        .element(
          page.getByText(
            'atomic-commerce-search-box-instant-products component error'
          )
        )
        .toBeInTheDocument();
    });
  });

  describe('when inside a search box', () => {
    let dispatchSpy: MockInstance;
    let initializeSpy: MockInstance;
    let element: AtomicCommerceSearchBoxInstantProducts;

    beforeEach(async () => {
      dispatchSpy = vi.spyOn(
        AtomicCommerceSearchBoxInstantProducts.prototype,
        'dispatchEvent'
      );
      initializeSpy = vi.spyOn(
        AtomicCommerceSearchBoxInstantProducts.prototype,
        'initialize'
      );
      ({element} = await renderElements());
    });

    it('should dispatch the search box suggestions event', async () => {
      const event = buildCustomEvent(
        'atomic/searchBoxSuggestion/register',
        vi.fn()
      );
      expect(dispatchSpy).toHaveBeenCalledWith(event);
    });

    it('should assign the bindings from the event', async () => {
      expect(element.bindings).toBeDefined();
      expect(element.bindings).toEqual(
        expect.objectContaining({
          ...defaultBindings,
          i18n: expect.anything(),
        })
      );
    });

    it('should call initialize after assigning bindings', async () => {
      expect(initializeSpy).toHaveBeenCalled();
    });
  });

  describe('#initialize', () => {
    it('should create an instant products controller', async () => {
      const {element} = await renderElements();

      expect(buildInstantProducts).toHaveBeenCalledWith(
        element.bindings.engine,
        {options: {}}
      );
    });

    it('should call the store onChange method to promote child products to parent', async () => {
      const {element} = await renderElements();

      expect(element.bindings.store.onChange).toHaveBeenCalledWith(
        'activeProductChild',
        expect.any(Function)
      );
    });

    it('should return a position that is the index of the element', async () => {
      const {element, searchBox} = await renderElements();

      const object = element.initialize();

      const position = Array.from(searchBox.children).indexOf(element);
      expect(object.position).toBe(position);
    });

    it('should return a panel that is "right"', async () => {
      const {element} = await renderElements();

      const object = element.initialize();

      expect(object.panel).toBe('right');
    });

    describe('when returning the onSuggestedQueryChange function', () => {
      it('should update the query in the instant products controller', async () => {
        const fakeController = buildFakeInstantProducts();
        vi.mocked(buildInstantProducts).mockReturnValue(fakeController);

        const {element} = await renderElements();
        const object = element.initialize();

        const newQuery = 'new query';
        await object.onSuggestedQueryChange?.(newQuery);
        expect(fakeController.updateQuery).toHaveBeenCalledWith(newQuery);
      });

      it('should return a promise function that resolves to undefined', async () => {
        const {element} = await renderElements();
        const object = element.initialize();

        expect(object.onSuggestedQueryChange).toBeInstanceOf(Function);
        await expect(
          object.onSuggestedQueryChange!('new query')
        ).resolves.toBeUndefined();
      });
    });

    describe('when returning the renderItems function', () => {
      it('should return an empty array when there is no suggested query', async () => {
        const {element} = await renderElements({
          suggestedQuery: () => undefined,
        });
        const object = element.initialize();

        expect(object.renderItems()).toEqual([]);
      });

      it('should return an empty array when the browser is in mobile mode', async () => {
        const {element} = await renderElements({
          store: {
            isMobile: vi.fn(() => true),
            onChange: vi.fn(),
          },
        });
        const object = element.initialize();

        expect(object.renderItems()).toEqual([]);
      });

      describe('when the browser is not in mobile mode and there is a suggested query', () => {
        let element: AtomicCommerceSearchBoxInstantProducts;
        let object: SearchBoxSuggestions;
        let items: SearchBoxSuggestionElement[];

        beforeEach(async () => {
          vi.mocked(buildInstantProducts).mockReturnValue(
            buildFakeInstantProducts()
          );
          ({element} = await renderElements());
          object = element.initialize();
          items = object.renderItems();
        });

        it('should return the correct number of items', () => {
          // 3 products + 1 show all item
          expect(items.length).toBe(4);
        });

        it('should have the correct properties for the instant products item', async () => {
          expect(items[0]).toEqual(
            expect.objectContaining({
              part: 'instant-results-item',
              ariaLabel: 'Product 1, instant product',
              key: 'instant-result-12345',
            })
          );
        });

        it('should have the correct properties for the show all item', async () => {
          expect(items[items.length - 1]).toEqual(
            expect.objectContaining({
              part: 'instant-results-show-all',
              ariaLabel: 'See all products',
              key: 'instant-results-show-all-button',
            })
          );
        });

        it('should have a atomic-product element as content for the instant products item', async () => {
          expect(items[0].content).toBeInstanceOf(HTMLElement);
          expect((items[0].content as Element).tagName).toBe('ATOMIC-PRODUCT');
        });

        it('should have a div element as content for the show all item', async () => {
          expect(items[items.length - 1].content).toBeInstanceOf(HTMLElement);
          expect((items[items.length - 1].content as Element).tagName).toBe(
            'DIV'
          );
        });

        it('should have the correct onSelect function for the show all item', async () => {
          items[items.length - 1].onSelect?.(new Event('click'));

          expect(element.bindings.clearSuggestions).toHaveBeenCalled();
          expect(
            element.bindings.searchBoxController.updateText
          ).toHaveBeenCalledWith(buildFakeInstantProducts().state.query);
          expect(
            element.bindings.searchBoxController.submit
          ).toHaveBeenCalled();
        });

        describe('when rendering the content', () => {
          it('should have the "outline" part on the atomic-product for the instant products item', () => {
            expect((items[0].content as Element).getAttribute('part')).toBe(
              'outline'
            );
          });

          it('should have the "instant-results-show-all-button" part on the show all item', () => {
            expect(
              (items[items.length - 1].content as Element).getAttribute('part')
            ).toBe('instant-results-show-all-button');
          });

          it('should have the correct text content for the show all item', () => {
            expect(
              (
                items[items.length - 1].content as HTMLElement
              ).textContent?.trim()
            ).toBe('See all products');
          });
        });
      });
    });
  });
});

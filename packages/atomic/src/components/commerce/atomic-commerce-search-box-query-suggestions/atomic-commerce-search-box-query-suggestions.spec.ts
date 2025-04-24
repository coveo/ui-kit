import {buildCustomEvent} from '@/src/utils/event-utils';
import {fixture} from '@/vitest-utils/testing-helpers/fixture';
import {
  defaultBindings,
  FixtureAtomicCommerceSearchBox,
  renderInAtomicCommerceSearchBox,
} from '@/vitest-utils/testing-helpers/fixtures/atomic/commerce/atomic-commerce-search-box-fixture';
import {buildFakeLoadQuerySuggestActions} from '@/vitest-utils/testing-helpers/fixtures/headless/commerce/query-suggest-actions';
import {loadQuerySuggestActions} from '@coveo/headless/commerce';
import {page} from '@vitest/browser/context';
import {html} from 'lit';
import {describe, it, vi, expect, beforeEach, MockInstance} from 'vitest';
import './atomic-commerce-search-box-query-suggestions';
import {AtomicCommerceSearchBoxQuerySuggestions} from './atomic-commerce-search-box-query-suggestions';

vi.mock('@coveo/headless/commerce', {spy: true});

describe('AtomicCommerceSearchBoxQuerySuggestions', () => {
  beforeEach(() => {
    vi.mocked(loadQuerySuggestActions).mockReturnValue(
      buildFakeLoadQuerySuggestActions()
    );
  });

  describe('when connected', () => {
    describe('when outside of a search box', () => {
      let consoleErrorSpy: MockInstance;
      let element: AtomicCommerceSearchBoxQuerySuggestions;

      beforeEach(async () => {
        consoleErrorSpy = vi.spyOn(console, 'error');
        element = await fixture(
          html`<atomic-commerce-search-box-query-suggestions></atomic-commerce-search-box-query-suggestions>`
        );
      });

      it('should log an error in the console', async () => {
        expect(consoleErrorSpy).toHaveBeenCalledWith(
          new Error(
            'The "atomic-commerce-search-box-query-suggestions" component was not handled, as it is not a child of the following elements: atomic-commerce-search-box'
          ),
          element
        );
      });

      it('should display an error component', async () => {
        await expect
          .element(
            page.getByText(
              'atomic-commerce-search-box-query-suggestions component error'
            )
          )
          .toBeInTheDocument();
      });
    });

    describe('when inside a search box', () => {
      let dispatchSpy: MockInstance;
      let initializeSpy: MockInstance;
      let element: AtomicCommerceSearchBoxQuerySuggestions;

      beforeEach(async () => {
        dispatchSpy = vi.spyOn(
          AtomicCommerceSearchBoxQuerySuggestions.prototype,
          'dispatchEvent'
        );
        initializeSpy = vi.spyOn(
          AtomicCommerceSearchBoxQuerySuggestions.prototype,
          'initialize'
        );
        ({element} =
          await renderInAtomicCommerceSearchBox<AtomicCommerceSearchBoxQuerySuggestions>(
            {
              template: html`<atomic-commerce-search-box-query-suggestions></atomic-commerce-search-box-query-suggestions>`,
              selector: 'atomic-commerce-search-box-query-suggestions',
            }
          ));
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
  });

  describe('when initialized', () => {
    let element: AtomicCommerceSearchBoxQuerySuggestions;
    let atomicCommerceSearchBox: FixtureAtomicCommerceSearchBox;

    beforeEach(async () => {
      ({element, searchBox: atomicCommerceSearchBox} =
        await renderInAtomicCommerceSearchBox<AtomicCommerceSearchBoxQuerySuggestions>(
          {
            template: html`<atomic-commerce-search-box-query-suggestions></atomic-commerce-search-box-query-suggestions>`,
            selector: 'atomic-commerce-search-box-query-suggestions',
          }
        ));
    });

    it('should dispatch registerQuerySuggest with the correct id and count', async () => {
      expect(
        loadQuerySuggestActions(element.bindings.engine).registerQuerySuggest
      ).toHaveBeenCalledWith(
        expect.objectContaining({
          id: element.bindings.id,
          count: element.bindings.numberOfQueries,
        })
      );
    });

    it('should return a position that is the index of the element', async () => {
      const object = element.initialize();

      const position = Array.from(atomicCommerceSearchBox.children).indexOf(
        element
      );
      expect(object.position).toBe(position);
    });

    it('should return a onInput that calls fetchQuerySuggestions', async () => {
      const object = element.initialize();

      object.onInput?.();

      expect(
        loadQuerySuggestActions(element.bindings.engine).fetchQuerySuggestions
      ).toHaveBeenCalledWith(
        expect.objectContaining({
          id: element.bindings.id,
        })
      );
    });

    describe('renderItems', () => {
      it('should return the correct number of items', async () => {
        const object = element.initialize();
        const items = object.renderItems();

        expect(items.length).toBe(
          element.bindings.searchBoxController.state.suggestions.length
        );
      });

      it('each item should have the correct properties', async () => {
        const object = element.initialize();
        const items = object.renderItems();

        expect(items[0]).toEqual(
          expect.objectContaining({
            part: 'query-suggestion-item',
            query: 'suggestion1',
            ariaLabel: '“suggestion1”, suggested query',
            key: 'qs-suggestion1',
          })
        );
      });

      it('each item should have the correct content', async () => {
        const object = element.initialize();
        const items = object.renderItems();

        expect(items[0].content).toBeDefined();
        expect(items[0].content).toBeInstanceOf(HTMLElement);
      });

      it('each item should have the correct onSelect function', async () => {
        const object = element.initialize();
        const items = object.renderItems();
        const suggestion =
          element.bindings.searchBoxController.state.suggestions[0].rawValue;

        items[0].onSelect?.(new Event('click'));

        expect(
          element.bindings.searchBoxController.selectSuggestion
        ).toHaveBeenCalledWith(suggestion);
      });

      describe('content', () => {
        it.todo(
          'should contain an icon if there are multiple kind of suggestions',
          async () => {}
        );
        it.todo(
          'should not contain an icon if there is only one kind of suggestion',
          async () => {}
        );
        it.todo(
          'should contain the highlighted value if there is a query',
          async () => {}
        );
        it.todo(
          'should contain the raw value if there is no query',
          async () => {}
        );
      });
    });
  });

  // describe('when rendered by the search box', () => {
  //   const renderElements = async (bindings: {} = {}) => {
  //     const {element, atomicCommerceSearchBox} =
  //       await renderInAtomicCommerceSearchBox<AtomicCommerceSearchBoxQuerySuggestions>(
  //         {
  //           template: html`<atomic-commerce-search-box-query-suggestions></atomic-commerce-search-box-query-suggestions>`,
  //           selector: 'atomic-commerce-search-box-query-suggestions',
  //           bindings,
  //         }
  //       );

  //     await atomicCommerceSearchBox.initialize();
  //     atomicCommerceSearchBox.requestUpdate();

  //     return {element, atomicCommerceSearchBox};
  //   };

  //   it('should render an icon if there are multiple kind of suggestions', async () => {
  //     const {atomicCommerceSearchBox} = await renderElements({
  //       getSuggestions: () => {
  //         return [
  //           {
  //             highlightedValue: 'suggestion1',
  //             rawValue: 'suggestion1',
  //           },
  //           {
  //             highlightedValue: 'suggestion2',
  //             rawValue: 'suggestion2',
  //           },
  //         ];
  //       },
  //     });

  //     const icon =
  //       atomicCommerceSearchBox.shadowRoot?.querySelector('atomic-icon');
  //     await expect.element(icon!).toBeInTheDocument();
  //   });

  //   it('should not render an icon if there is only one kind of suggestion', async () => {
  //     const {atomicCommerceSearchBox} = await renderElements();

  //     const icon =
  //       atomicCommerceSearchBox.shadowRoot?.querySelector('atomic-icon');
  //     expect(icon).not.toBeInTheDocument();
  //   });

  //   it('should render the highlighted value if there is a query', async () => {
  //     await renderElements({
  //       searchBoxController: {
  //         state: {
  //           suggestions: [
  //             {
  //               highlightedValue: 'suggestion1Highlighted',
  //               rawValue: 'suggestion1',
  //             },
  //           ],
  //           value: 'query',
  //         },
  //         selectSuggestion: vi.fn(),
  //       },
  //     });

  //     await expect
  //       .element(page.getByText('suggestion1Highlighted'))
  //       .toBeVisible();
  //   });

  //   it('should render the raw value if there is no query', async () => {
  //     await renderElements();

  //     await expect.element(page.getByText('suggestion1')).toBeVisible();
  //   });
  // });
});

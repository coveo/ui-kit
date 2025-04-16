import {SafeStorage, StorageItems} from '@/src/utils/local-storage-utils';
import {createTestI18n} from '@/vitest-utils/i18n-utils';
import {fixture} from '@/vitest-utils/testing-helpers/fixture';
import * as headless from '@coveo/headless/commerce';
import {html} from 'lit';
import {ifDefined} from 'lit/directives/if-defined.js';
import {afterEach, describe, test, vi, expect} from 'vitest';
import * as utils from '../../../utils/utils';
import {SuggestionManager} from '../../common/suggestions/suggestion-manager';
import {AtomicCommerceSearchBox} from './atomic-commerce-search-box';
import './atomic-commerce-search-box';

interface Mocks {
  searchBoxState: headless.SearchBoxState | headless.StandaloneSearchBoxState;
  suggestionManager: SuggestionManager<headless.SearchBox>;
  searchBox:
    | Omit<headless.SearchBox, 'state'>
    | Omit<headless.StandaloneSearchBox, 'state'>
    | undefined;
}

const mocks: Mocks = vi.hoisted(() => {
  return {
    searchBoxState: {
      value: 'query',
      isLoading: false,
      suggestions: [],
      isLoadingSuggestions: false,
      searchBoxId: 'default-search-box-id',
    },
    suggestionManager: {
      hasSuggestions: true,
      suggestions: [],
      leftSuggestionElements: [],
      rightSuggestionElements: [],
      allSuggestionElements: [],
      leftPanel: undefined,
      rightPanel: undefined,
      initializeSuggestions: vi.fn(),
      updateSuggestions: vi.fn(),
      clearSuggestions: vi.fn(),
      forceUpdate: vi.fn(),
      triggerSuggestions: vi.fn(),
    } as unknown as SuggestionManager<headless.SearchBox>,
    searchBox: {
      updateRedirectUrl: vi.fn(),
      afterRedirection: vi.fn(),
      updateText: vi.fn(),
      submit: vi.fn(),
      clear: vi.fn(),
      showSuggestions: vi.fn(),
      selectSuggestion: vi.fn(),
      subscribe: vi.fn(),
    },
  };
});

vi.mock('@/src/decorators/error-guard', () => ({
  errorGuard: vi.fn(),
}));

vi.mock('@/src/decorators/binding-guard', () => ({
  bindingGuard: vi.fn(),
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

vi.mock(import('../../../utils/utils'), async (importOriginal) => {
  const mod = await importOriginal();
  return {
    ...mod,
    randomID: vi.fn((prefix?: string, _length?: number) => `${prefix}123`),
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
              activeChildProductId: 's',
            },
          },
          i18n,
          engine: {
            dispatch: vi.fn(),
          },
        };

        this.searchBox = mocks.searchBox;
        this.suggestionManager = mocks.suggestionManager;
      }
    };
  }),
  BindingController: class {},
}));

vi.mock('@/src/utils/replace-breakpoint', () => {
  return {
    updateBreakpoints: vi.fn(),
  };
});

vi.mock('@coveo/headless/commerce', () => {
  return {
    buildSearchBox: vi.fn(() => {
      return mocks.searchBox;
    }),
    buildStandaloneSearchBox: vi.fn(() => {
      return mocks.searchBox;
    }),
    loadQuerySetActions: vi.fn(() => ({
      updateQuerySetQuery: vi.fn(({id, query}) => {
        // Mock implementation for updateQuerySetQuery
        console.log(
          `updateQuerySetQuery called with id: ${id}, query: ${query}`
        );
      }),
    })),
  };
});

describe('AtomicCommerceSearchBox', () => {
  afterEach(() => {
    mocks.searchBoxState = {
      value: 'query',
      isLoading: false,
      suggestions: [],
      isLoadingSuggestions: false,
      searchBoxId: 'default-search-box-id',
    };
    mocks.searchBox = {
      updateRedirectUrl: vi.fn(),
      afterRedirection: vi.fn(),
      updateText: vi.fn(),
      submit: vi.fn(),
      clear: vi.fn(),
      showSuggestions: vi.fn(),
      selectSuggestion: vi.fn(),
      subscribe: vi.fn(),
    };
    mocks.suggestionManager = {
      hasSuggestions: true,
      suggestions: [],
      leftSuggestionElements: [],
      rightSuggestionElements: [],
      allSuggestionElements: [],
      leftPanel: undefined,
      rightPanel: undefined,
      initializeSuggestions: vi.fn(),
      clearSuggestions: vi.fn(),
      forceUpdate: vi.fn(),
      triggerSuggestions: vi.fn(),
    };
  });
  const setupElement = async ({
    redirectionUrl,
  }: {redirectionUrl?: string} = {}) => {
    const element = await fixture<AtomicCommerceSearchBox>(
      html`<atomic-commerce-search-box
        redirection-url=${ifDefined(redirectionUrl)}
      ></atomic-commerce-search-box>`
    );

    element.initialize();
    return element;
  };

  describe('when constructed', () => {
    test('should call replaceChildren()', () => {
      const spy = vi.spyOn(
        AtomicCommerceSearchBox.prototype,
        'replaceChildren'
      );
      new AtomicCommerceSearchBox();
      expect(spy).toHaveBeenCalled();
    });

    test('should add an event listener for "atomic/selectChildProduct"', () => {
      const spy = vi.spyOn(
        AtomicCommerceSearchBox.prototype,
        'addEventListener'
      );
      new AtomicCommerceSearchBox();
      expect(spy).toHaveBeenCalledWith(
        'atomic/selectChildProduct',
        expect.any(Function)
      );
    });
  });

  describe('when connectedCallback is called', () => {
    test('should add an event listener for "atomic/searchBoxSuggestion/register"', async () => {
      const element = await setupElement();
      const spy = vi.spyOn(element, 'addEventListener');

      element.connectedCallback();

      expect(spy).toHaveBeenCalledWith(
        'atomic/searchBoxSuggestion/register',
        expect.any(Function)
      );
    });

    test('should replace children with cloned original children if #originalChildren is not empty', async () => {
      const element = await fixture<AtomicCommerceSearchBox>(
        html`<atomic-commerce-search-box
          ><span id="original"></span
        ></atomic-commerce-search-box>`
      );
      const replaceChildrenSpy = vi.spyOn(element, 'replaceChildren');

      element.connectedCallback();

      const span = document.createElement('span');
      span.id = 'original';
      expect(replaceChildrenSpy).toHaveBeenCalledWith(span);
    });

    test('should replace children with default elements if #originalChildren is empty', async () => {
      const element = await setupElement();
      const replaceChildrenSpy = vi.spyOn(element, 'replaceChildren');

      element.connectedCallback();

      const recentQueries = document.createElement(
        'atomic-commerce-search-box-recent-queries'
      );
      const querySuggestions = document.createElement(
        'atomic-commerce-search-box-query-suggestions'
      );
      expect(replaceChildrenSpy).toHaveBeenCalledWith(
        recentQueries,
        querySuggestions
      );
    });
  });

  describe('when willUpdate is called', () => {
    describe('when is not a standalone search box', () => {
      test('should return when searchBoxState or searchBox is not defined', async () => {
        mocks.searchBox = undefined;
        const element = await setupElement();
        const spy = vi.spyOn(SafeStorage.prototype, 'setJSON');

        element.willUpdate();

        expect(spy).not.toHaveBeenCalled();
      });

      test('should return if redirectTo is not in the searchBoxState object or if afterRedirection is not in the searchBox object', async () => {
        const element = await setupElement();
        const spy = vi.spyOn(SafeStorage.prototype, 'setJSON');

        element.willUpdate();

        expect(spy).not.toHaveBeenCalled();
      });

      test('should return if redirectTo is an empty string', async () => {
        mocks.searchBoxState = {
          value: 'query',
          redirectTo: '',
        } as unknown as headless.SearchBoxState;
        const element = await setupElement();
        const spy = vi.spyOn(SafeStorage.prototype, 'setJSON');

        element.willUpdate();

        expect(spy).not.toHaveBeenCalled();
      });
    });

    describe('when is a standalone search box', () => {
      test('should set the data in the SafeStorage', async () => {
        mocks.searchBoxState = {
          redirectTo: '/search',
          value: 'query',
        } as unknown as headless.SearchBoxState;
        const element = await setupElement();
        const spy = vi.spyOn(SafeStorage.prototype, 'setJSON');

        element.willUpdate();

        expect(spy).toHaveBeenCalledWith(
          StorageItems.STANDALONE_SEARCH_BOX_DATA,
          {
            value: 'query',
            enableQuerySyntax: false,
          }
        );
      });

      test('should call afterRedirection', async () => {
        mocks.searchBoxState = {
          redirectTo: '/search',
          value: 'query',
        } as unknown as headless.SearchBoxState;
        const element = await setupElement();
        const spyOnElement = vi.spyOn(
          element.searchBox as headless.StandaloneSearchBox,
          'afterRedirection'
        );

        element.willUpdate();

        expect(spyOnElement).toHaveBeenCalled();
      });

      test('should dispatch the redirect event', async () => {
        const element = await setupElement();
        const dispatchEventSpy = vi.spyOn(element, 'dispatchEvent');
        mocks.searchBoxState = {
          redirectTo: '/search',
          value: 'query',
        } as unknown as headless.SearchBoxState;

        element.willUpdate();

        expect(dispatchEventSpy).toHaveBeenCalledWith(
          expect.objectContaining({type: 'redirect'})
        );
      });
    });
  });

  describe('when initialized', () => {
    test('should assign a unique id to the component', async () => {
      const element = await setupElement();
      const randomIDSpy = vi.spyOn(utils, 'randomID');

      element.initialize();

      expect(randomIDSpy).toHaveBeenCalledWith('atomic-commerce-search-box-');
      expect(element.id).toBe('atomic-commerce-search-box-123');
    });

    describe('when initializing the search box controller', () => {
      test('should call buildStandaloneSearchBox when there is a redirectionUrl', async () => {
        const element = await setupElement({redirectionUrl: '/search'});
        const mockController = {some: 'controller'};
        const buildSpy = vi
          .spyOn(headless, 'buildStandaloneSearchBox')
          //@ts-expect-error wrong typing for simpler tests
          .mockReturnValue(mockController);

        element.initialize();

        expect(buildSpy).toHaveBeenCalledWith(
          undefined,
          expect.objectContaining({
            options: expect.objectContaining({
              redirectionUrl: '/search',
            }),
          })
        );
        expect(element.searchBox).toBe(mockController);
      });

      test('should call buildSearchBox when there is not a redirectionUrl', async () => {
        const element = await setupElement();
        const mockController = {some: 'controller'};
        const buildSpy = vi
          .spyOn(headless, 'buildSearchBox')
          //@ts-expect-error wrong typing for simpler tests
          .mockReturnValue(mockController);

        element.initialize();

        expect(buildSpy).toHaveBeenCalledWith(undefined, expect.any(Object));
        expect(element.searchBox).toBe(mockController);
      });
    });

    describe('when initializing the suggestions manager', () => {
      test('should not reinitialize if suggestionManager already exists', async () => {
        const element = await setupElement();

        element.initialize();

        //@ts-expect-error private field
        const suggestionManager = element.suggestionManager;
        expect(suggestionManager).toBe(mocks.suggestionManager);
      });

      test('should create a new SuggestionManager instance if it does not exist', async () => {
        const element = await setupElement();
        // @ts-expect-error force it to be undefined
        element.suggestionManager = undefined;

        element.initialize();

        // @ts-expect-error private field
        expect(element.suggestionManager).toBeInstanceOf(SuggestionManager);
      });
    });
  });

  describe('when receiving the atomic/selectChildProduct event', () => {
    test('should assign the store.state.activeChildProductId to the child from the event', async () => {
      const element = await setupElement();

      const event = new CustomEvent('atomic/selectChildProduct', {
        detail: {
          child: '123',
        },
      });
      element.dispatchEvent(event);

      expect(element.bindings.store.state.activeProductChild).toBe('123');
    });

    test('should call suggestionManager.forceUpdate', async () => {
      const element = await setupElement();

      //@ts-expect-error private field
      const spyOnElement = vi.spyOn(element.suggestionManager, 'forceUpdate');
      const event = new CustomEvent('atomic/selectChildProduct', {
        detail: {
          child: '123',
        },
      });
      element.dispatchEvent(event);

      expect(spyOnElement).toHaveBeenCalled();
    });
  });

  describe('when receiving the atomic/searchBoxSuggestion/register event', () => {
    test('should add the event to the event queue', async () => {
      const element = await setupElement();

      const event = new CustomEvent('atomic/searchBoxSuggestion/register', {
        detail: {
          suggestion: 'suggestion',
        },
      });
      element.dispatchEvent(event);

      //@ts-expect-error private field
      expect(element.searchBoxSuggestionEventsQueue).toContain(event);
    });
  });

  //TODO: Finish when have and / or locators
  // describe('when rendering', () => {
  //   describe('when focusing out of the search box', () => {
  //     test('should clear suggestions', async () => {
  //       // const firstSuggestion = document.createElement('div');
  //       // firstSuggestion.innerHTML = 'first suggestion';
  //       // mocks.suggestionManager.leftSuggestionElements = [
  //       //   {
  //       //     key: 'key-1',
  //       //     content: document.createElement('div'),
  //       //   },
  //       // ];
  //       // const element = await setupElement();
  //       // await userEvent.click(page.getByPlaceholder('Search'));
  //       // await expect
  //       //   .element(page.getByRole('application'))
  //       //   .toHaveClass('hidden');
  //       //click on it
  //       // element.isExpanded = true;
  //       // element.render();
  //     });
  //   });

  //   describe('when focusing in the search box', () => {
  //     test('should show suggestions if there are any', async () => {
  //       mocks.suggestionManager.leftSuggestionElements = [
  //         {
  //           key: 'key-1',
  //           content: document.createElement('div'),
  //         },
  //       ];
  //       await setupElement();

  //       await page.getByPlaceholder('Search').click();

  //       await expect
  //         .element(page.getByRole('application'))
  //         .not.toHaveClass('hidden');
  //     });
  //   });

  //   describe('when inputting text in the search box', () => {
  //     test('should dispatch updateQuerySetQuery with the new query', async () => {
  //       const element = await setupElement();
  //       const engineSpy = vi.spyOn(element.bindings.engine, 'dispatch');
  //       const consoleLogSpy = vi.spyOn(console, 'log');

  //       await page.getByPlaceholder('Search').fill('new query');

  //       expect(engineSpy).toHaveBeenCalled();
  //       expect(consoleLogSpy).toHaveBeenCalledWith(
  //         'updateQuerySetQuery called with id: atomic-commerce-search-box-123, query: new query'
  //       );
  //     });

  //     test('should show suggestions', async () => {
  //       await setupElement();

  //       await page.getByPlaceholder('Search').fill('new query');

  //       await expect
  //         .element(page.getByRole('application'))
  //         .not.toHaveClass('hidden');
  //     });
  //   });

  //   // describe('when pressing a key in the search box', () => {
  //   //   test('should trigger a search if the key is "Enter"', async () => {});
  //   //   test('should clear suggestions if the key is "Escape"', async () => {});
  //   //   test('should navigate to the next value if the key is "ArrowDown"', async () => {});
  //   //   test('should navigate to the previous value if the key is "ArrowUp"', async () => {});
  //   //   test('should navigate to the right panel if the key is "ArrowRight"', async () => {});
  //   //   test('should navigate to the left panel if the key is "ArrowLeft"', async () => {});
  //   //   test('should clear suggestions if the key is "Tab"', async () => {});
  //   // });

  //   describe('when clicking the clear button', () => {
  //     test('should clear the query', async () => {
  //       await setupElement();
  //       await page.getByPlaceholder('Search').fill('new query');

  //       await page.getByLabelText('Clear').click();

  //       await expect.element(page.getByPlaceholder('Search')).toHaveValue('');
  //     });
  //   });

  //   describe('when clicking the submit button', () => {
  //     test('should submit the query', async () => {});
  //     test('should clear the suggestions', async () => {
  //       await setupElement();
  //       await page.getByPlaceholder('Search').fill('new query');

  //       const submitButton = page
  //         .getByRole('button')
  //         .and(page.getByTitle('Subscribe'));

  //       console.log(submitButton);
  //       // await page
  //       //   .getByRole('button')
  //       //   .and(page.getByLabelText('Search'))
  //       //   .click();
  //       // await page.getByLabelText('Search').nth(1).click();

  //       // await expect
  //       //   .element(page.getByRole('application'))
  //       //   .toHaveClass('hidden');
  //     });
  //   });

  //   describe('when rendering suggestions', () => {
  //     test('should not show suggestions if there are no suggestions', async () => {});
  //     test('should not show suggestions if search is disabled', async () => {});
  //     test('should render a left panel if there are left suggestions', async () => {});
  //     test('should render a right panel if there are right and left suggestions', async () => {});
  //   });

  //   // describe('when clicking a suggestion', () => {
  //   //   describe('when is a normal suggestion', () => {
  //   //     test('should clear suggestions', async () => {});
  //   //     test('should update the query with the suggestion value', async () => {});
  //   //   });

  //   //   describe('when is a recent query clear', () => {
  //   //     test('should trigger its onSelect callback', async () => {});
  //   //     test('should not clear suggestions', async () => {});
  //   //   });
  //   // });

  //   // describe('when hovering a suggestions', () => {
  //   //   test('should update the keyboard active descendant', async () => {});
  //   // });
  // });
});

test('test every prop that when sent is reflected');
test('test textAreaLabel');

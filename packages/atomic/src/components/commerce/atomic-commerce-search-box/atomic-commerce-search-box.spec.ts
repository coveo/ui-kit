import {SafeStorage, StorageItems} from '@/src/utils/local-storage-utils';
import {createTestI18n} from '@/vitest-utils/i18n-utils';
import {fixture} from '@/vitest-utils/testing-helpers/fixture';
import * as headless from '@coveo/headless/commerce';
import {
  buildSearchBox,
  buildStandaloneSearchBox,
} from '@coveo/headless/commerce';
import {html} from 'lit';
import {ifDefined} from 'lit/directives/if-defined.js';
import {afterEach, describe, test, vi, expect} from 'vitest';
import * as utils from '../../../utils/utils';
import {SuggestionManager} from '../../common/suggestions/suggestion-manager';
import {AtomicCommerceSearchBox} from './atomic-commerce-search-box';
import './atomic-commerce-search-box';

let mocks = await vi.hoisted(async () => {
  const specMocks = await import('./spec-mocks');
  return specMocks.default;
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
        console.log(
          `updateQuerySetQuery called with id: ${id}, query: ${query}`
        );
      }),
    })),
  };
});

describe('AtomicCommerceSearchBox', () => {
  afterEach(async () => {
    mocks = (await import('./spec-mocks')).default;
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

      element.initialize();

      expect(utils.randomID).toHaveBeenCalledWith(
        'atomic-commerce-search-box-'
      );
      expect(element.id).toBe('atomic-commerce-search-box-123');
    });

    describe('when initializing the search box controller', () => {
      test('should call buildStandaloneSearchBox when there is a redirectionUrl', async () => {
        const element = await setupElement({redirectionUrl: '/search'});
        const mockController = {some: 'controller'};
        //@ts-expect-error wrong typing for simpler tests
        buildStandaloneSearchBox.mockReturnValue(mockController);

        element.initialize();

        expect(buildStandaloneSearchBox).toHaveBeenCalledWith(
          {dispatch: expect.any(Function)},
          expect.any(Object)
        );
        expect(element.searchBox).toBe(mockController);
      });

      test('should call buildSearchBox when there is not a redirectionUrl', async () => {
        const element = await setupElement();
        const mockController = {some: 'controller'};

        //@ts-expect-error wrong typing for simpler tests
        buildSearchBox.mockReturnValue(mockController);

        element.initialize();

        expect(buildSearchBox).toHaveBeenCalledWith(
          {
            dispatch: expect.any(Function),
          },
          expect.any(Object)
        );
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
  describe('when rendering', () => {
    describe('when focusing out of the search box', () => {
      test('should clear suggestions', async () => {});
    });

    describe('when focusing in the search box', () => {
      test('should show suggestions if there are any', async () => {});
    });

    describe('when inputting text in the search box', () => {
      test('should dispatch updateQuerySetQuery with the new query', async () => {});

      test('should show suggestions', async () => {});
    });

    describe('when pressing a key in the search box', () => {
      test('should trigger a search if the key is "Enter"', async () => {});
      test('should clear suggestions if the key is "Escape"', async () => {});
      test('should navigate to the next value if the key is "ArrowDown"', async () => {});
      test('should navigate to the previous value if the key is "ArrowUp"', async () => {});
      test('should navigate to the right panel if the key is "ArrowRight"', async () => {});
      test('should navigate to the left panel if the key is "ArrowLeft"', async () => {});
      test('should clear suggestions if the key is "Tab"', async () => {});
    });

    describe('when clicking the clear button', () => {
      test('should clear the query', async () => {});
    });

    describe('when clicking the submit button', () => {
      test('should submit the query', async () => {});
      test('should clear the suggestions', async () => {});
    });

    describe('when rendering suggestions', () => {
      test('should not show suggestions if there are no suggestions', async () => {});
      test('should not show suggestions if search is disabled', async () => {});
      test('should render a left panel if there are left suggestions', async () => {});
      test('should render a right panel if there are right and left suggestions', async () => {});
    });

    describe('when clicking a suggestion', () => {
      describe('when is a normal suggestion', () => {
        test('should clear suggestions', async () => {});
        test('should update the query with the suggestion value', async () => {});
      });

      describe('when is a recent query clear', () => {
        test('should trigger its onSelect callback', async () => {});
        test('should not clear suggestions', async () => {});
      });
    });

    describe('when hovering a suggestions', () => {
      test('should update the keyboard active descendant', async () => {});
    });
  });
});

test('test every prop that when sent is reflected');
test('test textAreaLabel');

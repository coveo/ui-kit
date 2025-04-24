import {createTestI18n} from '@/vitest-utils/i18n-utils';
import {fixture} from '@/vitest-utils/testing-helpers/fixture';
import * as headless from '@coveo/headless/commerce';
import {
  buildSearchBox,
  buildStandaloneSearchBox,
  SearchBox,
} from '@coveo/headless/commerce';
import {page, userEvent} from '@vitest/browser/context';
import {html} from 'lit';
import {ifDefined} from 'lit/directives/if-defined.js';
import {describe, test, vi, expect, beforeEach} from 'vitest';
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
    suggestionManager: {
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
    } as unknown as SuggestionManager<SearchBox>,
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
        console.log(
          `updateQuerySetQuery called with id: ${id}, query: ${query}`
        );
      }),
    })),
  };
});

describe('AtomicCommerceSearchBox', () => {
  beforeEach(() => {
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
      focusNextValue: vi.fn(),
      focusPreviousValue: vi.fn(),
      focusPanel: vi.fn(),
    } as unknown as SuggestionManager<SearchBox>;
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

  describe('when rendering', () => {
    describe('when focusing in the search box', () => {
      test('should trigger suggestions', async () => {
        const element = await setupElement();

        const triggerSuggestionsSpy = vi.spyOn(
          //@ts-expect-error private field
          element.suggestionManager,
          'triggerSuggestions'
        );

        await page.getByPlaceholder('Search').click();
        expect(triggerSuggestionsSpy).toHaveBeenCalled();
      });
    });

    describe('when inputting text in the search box', () => {
      test('should call suggestionManager.triggerSuggestions', async () => {
        const element = await setupElement();
        //@ts-expect-error private field
        const spy = vi.spyOn(element.suggestionManager, 'triggerSuggestions');

        await page.getByPlaceholder('Search').fill('test');

        expect(spy).toHaveBeenCalled();
      });
    });

    describe('when pressing a key in the search box', () => {
      test('should call submit if the key is "Enter"', async () => {
        const element = await setupElement();
        const onSubmitSpy = vi.spyOn(element.searchBox, 'submit');

        await page.getByPlaceholder('Search').click();
        await userEvent.keyboard('[Enter]');

        expect(onSubmitSpy).toHaveBeenCalled();
      });

      test('should clear suggestions if the key is "Escape"', async () => {
        const element = await setupElement();
        const clearSuggestionsSpy = vi.spyOn(
          //@ts-expect-error private field
          element.suggestionManager,
          'clearSuggestions'
        );

        await page.getByPlaceholder('Search').click();
        await userEvent.keyboard('[Escape]');

        expect(clearSuggestionsSpy).toHaveBeenCalled();
      });

      test('should call focusNextValue if the key is "ArrowDown"', async () => {
        const element = await setupElement();
        const focusNextValueSpy = vi.spyOn(
          //@ts-expect-error private field
          element.suggestionManager,
          'focusNextValue'
        );

        await page.getByPlaceholder('Search').click();
        await userEvent.keyboard('[ArrowDown]');

        expect(focusNextValueSpy).toHaveBeenCalled();
      });

      test('should call focusPreviousValue if the key is "ArrowUp"', async () => {
        const element = await setupElement();
        const focusPreviousValueSpy = vi.spyOn(
          //@ts-expect-error private field
          element.suggestionManager,
          'focusPreviousValue'
        );

        await page.getByPlaceholder('Search').click();
        await userEvent.keyboard('[ArrowUp]');

        expect(focusPreviousValueSpy).toHaveBeenCalled();
      });

      test('should call focusPanel with "right" if the key is "ArrowRight"', async () => {
        mocks.searchBoxState = {
          value: '',
          isLoading: false,
          suggestions: [],
          isLoadingSuggestions: false,
          searchBoxId: 'default-search-box-id',
        };
        const element = await setupElement();
        const focusPanelSpy = vi.spyOn(
          //@ts-expect-error private field
          element.suggestionManager,
          'focusPanel'
        );

        await page.getByPlaceholder('Search').click();
        await userEvent.keyboard('[ArrowRight]');

        expect(focusPanelSpy).toHaveBeenCalledWith('right');
      });

      test('should call focusPanel with "left" if the key is "ArrowLeft"', async () => {
        mocks.searchBoxState = {
          value: '',
          isLoading: false,
          suggestions: [],
          isLoadingSuggestions: false,
          searchBoxId: 'default-search-box-id',
        };
        const element = await setupElement();
        const focusPanelSpy = vi.spyOn(
          //@ts-expect-error private field
          element.suggestionManager,
          'focusPanel'
        );

        await page.getByPlaceholder('Search').click();
        await userEvent.keyboard('[ArrowLeft]');

        expect(focusPanelSpy).toHaveBeenCalledWith('left');
      });

      test('should clear suggestions if the key is "Tab"', async () => {
        const element = await setupElement();
        const clearSuggestionsSpy = vi.spyOn(
          //@ts-expect-error private field
          element.suggestionManager,
          'clearSuggestions'
        );

        await page.getByPlaceholder('Search').click();
        await userEvent.keyboard('[Tab]');

        expect(clearSuggestionsSpy).toHaveBeenCalled();
      });
    });

    describe('when clicking the clear button', () => {
      test('should call clear on the search box', async () => {
        const element = await setupElement();
        const clearSpy = vi.spyOn(element.searchBox, 'clear');

        await page.getByRole('button', {name: 'Clear'}).click();

        expect(clearSpy).toHaveBeenCalled();
      });

      test('should call clearSuggestions on the suggestion manager', async () => {
        const element = await setupElement();
        const clearSuggestionsSpy = vi.spyOn(
          //@ts-expect-error private field
          element.suggestionManager,
          'clearSuggestions'
        );

        await page.getByRole('button', {name: 'Clear'}).click();

        expect(clearSuggestionsSpy).toHaveBeenCalled();
      });
    });
  });
});

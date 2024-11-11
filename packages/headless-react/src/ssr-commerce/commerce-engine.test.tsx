import {
  getSampleCommerceEngineConfiguration,
  InferStaticState,
  InferHydratedState,
  defineProductList,
  defineStandaloneSearchBox,
  NavigatorContextProvider,
  Product,
} from '@coveo/headless/ssr-commerce';
import {act, render, renderHook, screen} from '@testing-library/react';
import {randomUUID} from 'crypto';
import {PropsWithChildren} from 'react';
import React from 'react';
import {
  vi,
  expect,
  describe,
  test,
  beforeEach,
  MockInstance,
  afterEach,
} from 'vitest';
import {MissingEngineProviderError} from '../errors.js';
import {defineCommerceEngine} from './commerce-engine.js';

describe('Headless react SSR utils', () => {
  let errorSpy: MockInstance;
  const mockedNavigatorContextProvider: NavigatorContextProvider = () => {
    return {
      clientId: '123',
      location: 'https://www.example.com',
      referrer: 'https://www.google.com',
      userAgent: 'Mozilla/5.0',
    };
  };
  const sampleConfig = getSampleCommerceEngineConfiguration();
  beforeEach(() => {
    errorSpy = vi.spyOn(console, 'error');
  });

  afterEach(() => {
    errorSpy.mockClear();
  });

  test('defines react commerce engine', () => {
    const {
      useEngine,
      controllers,
      listingEngineDefinition,
      searchEngineDefinition,
      standaloneEngineDefinition,
      ...rest
    } = defineCommerceEngine({configuration: sampleConfig});
    const {
      fetchStaticState,
      hydrateStaticState,
      build,
      StaticStateProvider,
      HydratedStateProvider,
      setNavigatorContextProvider,
    } = listingEngineDefinition;

    const functions = [
      fetchStaticState,
      hydrateStaticState,
      build,
      useEngine,
      StaticStateProvider,
      HydratedStateProvider,
      setNavigatorContextProvider,
    ];

    const engineDefinitions = [
      searchEngineDefinition,
      standaloneEngineDefinition,
      listingEngineDefinition,
    ];

    functions.forEach((returnValue) =>
      expect(typeof returnValue).toBe('function')
    );

    engineDefinitions.forEach((returnValue) =>
      expect(typeof returnValue).toBe('object')
    );

    expect(controllers).toEqual({});
    expect(rest).toEqual({}); // No other return values
  });

  test('creates a hook based on given controller', () => {
    const {controllers} = defineCommerceEngine({
      configuration: sampleConfig,
      controllers: {
        productList: defineProductList(),
        searchBox: defineStandaloneSearchBox({
          options: {redirectionUrl: '/search'},
        }),
      },
    });
    expect(typeof controllers.useProductList).toEqual('function');
    expect(typeof controllers.useSearchBox).toEqual('function');
  });

  describe('context providers', () => {
    const productItemTestId = 'product-item';
    const numProducts = 10;
    const engineDefinition = defineCommerceEngine({
      configuration: sampleConfig,
      controllers: {
        productList: defineProductList(),
        searchBox: defineStandaloneSearchBox({
          options: {redirectionUrl: '/search'},
        }),
      },
    });
    const {
      listingEngineDefinition: {
        HydratedStateProvider,
        StaticStateProvider,
        fetchStaticState,
        hydrateStaticState,
        setNavigatorContextProvider,
      },
      controllers,
      useEngine,
    } = engineDefinition;

    function TestProductList() {
      const generateMockProduct: () => Product = () => {
        return {
          additionalFields: {},
          children: [],
          clickUri: '',
          ec_brand: '',
          ec_category: [],
          ec_color: '',
          ec_description: '',
          ec_gender: '',
          ec_images: [],
          ec_in_stock: false,
          ec_item_group_id: '',
          ec_listing: '',
          ec_name: '',
          ec_price: 0,
          ec_product_id: randomUUID(),
          ec_promo_price: 0,
          ec_rating: 1,
          ec_shortdesc: '',
          ec_thumbnails: [],
          permanentid: '',
          position: 0,
          totalNumberOfChildren: 0,
        };
      };

      const {state} = controllers.useProductList();

      state.products = Array.from({length: numProducts}, generateMockProduct);
      return (
        <ul>
          {state.products.map((product) => (
            <li key={product.ec_product_id} data-testid={productItemTestId}>
              {product.ec_name}
            </li>
          ))}
        </ul>
      );
    }

    async function checkRenderedProductList() {
      const products = await screen.findAllByTestId(productItemTestId);
      expect(errorSpy).not.toHaveBeenCalled();
      expect(products).toHaveLength(numProducts);

      products.forEach((product) => product.remove());
    }

    function checkRenderError(
      renderFunction: CallableFunction,
      expectedErrMsg: string
    ) {
      let err: Error | undefined = undefined;
      // Prevent expected error from being thrown in console when running tests
      const consoleErrorStub = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {});
      try {
        renderFunction();
      } catch (e) {
        err = e! as Error;
      } finally {
        consoleErrorStub.mockReset();
      }

      expect(err?.message).toBe(expectedErrMsg);
    }

    test('should throw error when controller hook is used without context', () => {
      checkRenderError(
        () => render(<TestProductList />),
        MissingEngineProviderError.message
      );
    });

    test('should render with StaticStateProvider', async () => {
      setNavigatorContextProvider(mockedNavigatorContextProvider);
      const staticState = await fetchStaticState();
      render(
        <StaticStateProvider controllers={staticState.controllers}>
          <TestProductList />
        </StaticStateProvider>
      );

      await checkRenderedProductList();
    });

    test('should hydrate products with HydratedStateProvider', async () => {
      setNavigatorContextProvider(mockedNavigatorContextProvider);
      const staticState = await fetchStaticState();
      const {engine, controllers} = await hydrateStaticState(staticState);

      render(
        <HydratedStateProvider engine={engine} controllers={controllers}>
          <TestProductList />
        </HydratedStateProvider>
      );

      await checkRenderedProductList();
    });

    describe('hooks', () => {
      const {listingEngineDefinition} = engineDefinition;
      let staticState: InferStaticState<typeof listingEngineDefinition>;
      let hydratedState: InferHydratedState<typeof listingEngineDefinition>;

      beforeEach(async () => {
        setNavigatorContextProvider(mockedNavigatorContextProvider);
        staticState = await fetchStaticState();
        hydratedState = await hydrateStaticState(staticState);
      });

      function staticStateProviderWrapper({children}: PropsWithChildren) {
        return (
          <StaticStateProvider controllers={staticState.controllers}>
            {children}
          </StaticStateProvider>
        );
      }

      function hydratedStateProviderWrapper({children}: PropsWithChildren) {
        return (
          <HydratedStateProvider
            controllers={hydratedState.controllers}
            engine={hydratedState.engine}
          >
            {children}
          </HydratedStateProvider>
        );
      }

      describe('useEngine hook', () => {
        test('should throw error with no context', async () => {
          checkRenderError(
            () => renderHook(() => useEngine()),
            MissingEngineProviderError.message
          );
        });

        test('should not return engine with static state provider', async () => {
          const {result} = renderHook(() => useEngine(), {
            wrapper: staticStateProviderWrapper,
          });
          expect(result.current).toBeUndefined();
        });

        test('should return engine with hydrated state provider', async () => {
          const {result} = renderHook(() => useEngine(), {
            wrapper: hydratedStateProviderWrapper,
          });
          expect(result.current).toStrictEqual(hydratedState.engine);
        });
      });

      describe('controller hooks', () => {
        const {useSearchBox} = engineDefinition.controllers;
        describe('with StaticStateProvider', () => {
          test('should define state but not controller', () => {
            const {result} = renderHook(() => useSearchBox(), {
              wrapper: staticStateProviderWrapper,
            });
            expect(result.current.state).toBeDefined();
            expect(result.current?.methods).toBeUndefined();
          });
        });

        describe('with HydratedStateProvider', () => {
          test('should define both state and controller', () => {
            const {result} = renderHook(() => useSearchBox(), {
              wrapper: hydratedStateProviderWrapper,
            });
            expect(result.current.state).toBeDefined();
            expect(result.current?.methods).toBeDefined();
          });

          test('should update state when method is called', () => {
            const {result} = renderHook(() => useSearchBox(), {
              wrapper: hydratedStateProviderWrapper,
            });
            const initialState = result.current.state;
            act(() => {
              result.current.methods?.updateText('foo');
            });

            expect(initialState).not.toStrictEqual(result.current.state);
            expect(result.current.state.value).toBe('foo');
          });
        });
      });
    });
  });
});

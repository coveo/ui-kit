import {describe, expectTypeOf, it} from 'vitest';
import {getSampleCommerceEngineConfiguration} from '../../../app/commerce-engine/commerce-engine-configuration.js';
import type {Controller} from '../../../controllers/controller/headless-controller.js';
import {buildMockNavigatorContext} from '../../../test/mock-navigator-context.js';
import type {EngineDefinition} from '../../common/types/engine.js';
import {defineProductList} from '../controllers/product-list/headless-product-list.ssr.js';
import {defineRecommendations} from '../controllers/recommendations/headless-recommendations.ssr.js';
import {defineSearchBox} from '../controllers/search-box/headless-search-box.ssr.js';
import type {SolutionType} from '../types/controller-constants.js';
import type {ControllerDefinitionsMap} from '../types/controller-definitions.js';
import type {InferHydratedState, InferStaticState} from '../types/controller-inference.js';
import type {CommerceStaticState} from '../types/fetch-static-state.js';
import type {CommerceHydratedState} from '../types/hydrate-static-state.js';
import type {CommerceEngineDefinition} from '../types/engine.js';
import {defineCommerceEngine} from './commerce-engine.ssr.js';

const controllers = {
  productList: defineProductList(),
  searchBox: defineSearchBox(),
  popularViewed: defineRecommendations({options: {slotId: 'slot-viewed'}}),
};

// Types the customer relies on for IntelliSense: everything below is inferred from the controllers
// of the definition, with no annotation on the customer's side.
const {
  listingEngineDefinition,
  searchEngineDefinition,
  standaloneEngineDefinition,
  recommendationEngineDefinition,
} = defineCommerceEngine({
  configuration: getSampleCommerceEngineConfiguration(),
  controllers,
});

type ListingStaticState = InferStaticState<typeof listingEngineDefinition>;
type ListingHydratedState = InferHydratedState<typeof listingEngineDefinition>;

describe('defineCommerceEngine', () => {
  it('should hydrate each definition with the static state it fetched, as is', () => {
    expectTypeOf<
      Parameters<typeof listingEngineDefinition.hydrateStaticState>[0]
    >().toEqualTypeOf<ListingStaticState>();
    expectTypeOf<Parameters<typeof searchEngineDefinition.hydrateStaticState>[0]>().toEqualTypeOf<
      InferStaticState<typeof searchEngineDefinition>
    >();
    expectTypeOf<
      Parameters<typeof standaloneEngineDefinition.hydrateStaticState>[0]
    >().toEqualTypeOf<InferStaticState<typeof standaloneEngineDefinition>>();
    expectTypeOf<
      Parameters<typeof recommendationEngineDefinition.hydrateStaticState>[0]
    >().toEqualTypeOf<InferStaticState<typeof recommendationEngineDefinition>>();
  });

  it('should take the navigator context per request, not on the definition', () => {
    const options = {configuration: getSampleCommerceEngineConfiguration()};
    const withProvider = {...options, navigatorContextProvider: () => buildMockNavigatorContext()};
    defineCommerceEngine({...options, controllers: {}});
    // @ts-expect-error: a navigatorContextProvider spread from shared options.
    defineCommerceEngine({...withProvider, controllers: {}});
    // @ts-expect-error: a navigatorContextProvider in an options variable.
    defineCommerceEngine(withProvider);
    expectTypeOf<ListingStaticState>().toHaveProperty('navigatorContext');
    expectTypeOf<ListingStaticState['accessToken']>().toEqualTypeOf<string | undefined>();
  });

  it('should stamp the static state with the solution type of its definition', () => {
    expectTypeOf<ListingStaticState['solutionType']>().toEqualTypeOf<SolutionType.listing>();
    expectTypeOf<
      InferStaticState<typeof searchEngineDefinition>['solutionType']
    >().toEqualTypeOf<SolutionType.search>();
  });

  it('should refuse the static state of another definition at compile time', () => {
    expectTypeOf<
      InferStaticState<typeof searchEngineDefinition>
    >().not.toMatchTypeOf<ListingStaticState>();
  });

  it('should let a page leave out its view URL', () => {
    type ListingContext = Parameters<typeof listingEngineDefinition.fetchStaticState>[0]['context'];

    expectTypeOf<{
      language: string;
      country: string;
      currency: 'USD';
    }>().toMatchTypeOf<ListingContext>();
    expectTypeOf<ListingContext['view']>().toEqualTypeOf<{url: string} | undefined>();
  });

  it('should always carry the view URL in the static state', () => {
    expectTypeOf<ListingStaticState['context']['view']['url']>().toEqualTypeOf<string>();

    function readViewUrl<TSolutionType extends SolutionType>(
      staticState: CommerceStaticState<typeof controllers, TSolutionType>
    ) {
      expectTypeOf(staticState.context.view.url).toEqualTypeOf<string>();
    }
    expectTypeOf(readViewUrl).toBeFunction();
  });

  it('should list the controllers of each kind of page in its static state', () => {
    expectTypeOf<ListingStaticState['controllers']>().toHaveProperty('productList');
    expectTypeOf<ListingStaticState['controllers']>().toHaveProperty('cart');
    expectTypeOf<ListingStaticState['controllers']>().toHaveProperty('context');
    expectTypeOf<ListingStaticState['controllers']>().toHaveProperty('parameterManager');
    expectTypeOf<ListingStaticState['controllers']>().not.toHaveProperty('searchBox');
    expectTypeOf<ListingStaticState['controllers']>().not.toHaveProperty('popularViewed');
    expectTypeOf<InferStaticState<typeof searchEngineDefinition>['controllers']>().toHaveProperty(
      'searchBox'
    );
    expectTypeOf<
      InferStaticState<typeof standaloneEngineDefinition>['controllers']
    >().not.toHaveProperty('parameterManager');
    expectTypeOf<
      InferStaticState<typeof recommendationEngineDefinition>['controllers']
    >().toHaveProperty('popularViewed');
  });

  it('should type the controllers of the static state as state snapshots', () => {
    expectTypeOf<ListingStaticState['controllers']['productList']>().toHaveProperty('state');
    expectTypeOf<ListingStaticState['controllers']['productList']>().not.toHaveProperty(
      'subscribe'
    );
    expectTypeOf<ListingStaticState['controllers']['cart']>().toHaveProperty('state');
    expectTypeOf<ListingStaticState['controllers']['cart']>().not.toHaveProperty('empty');
    expectTypeOf<ListingStaticState['controllers']['parameterManager']>().not.toHaveProperty(
      'synchronize'
    );
  });

  it('should not offer controller props on the static state, which never carries them', () => {
    expectTypeOf<
      InferStaticState<typeof recommendationEngineDefinition>['controllers']['popularViewed']
    >().not.toHaveProperty('productId');
  });

  it('should let code that is generic over the solution type reach cart and context', () => {
    function readUniversalControllers<TSolutionType extends SolutionType>(
      staticState: InferStaticState<CommerceEngineDefinition<{}, TSolutionType>>,
      hydratedState: InferHydratedState<CommerceEngineDefinition<{}, TSolutionType>>
    ) {
      expectTypeOf(staticState.controllers.cart).toHaveProperty('state');
      expectTypeOf(hydratedState.controllers.cart).toHaveProperty('empty');
      expectTypeOf(hydratedState.controllers.context).toHaveProperty('state');
    }
    expectTypeOf(readUniversalControllers).toBeFunction();
  });

  it('should hydrate the controllers of the page as live controllers', () => {
    expectTypeOf<ListingHydratedState['controllers']['productList']>().toHaveProperty('subscribe');
    expectTypeOf<ListingHydratedState['controllers']['parameterManager']>().toHaveProperty(
      'synchronize'
    );
    expectTypeOf<
      InferHydratedState<typeof standaloneEngineDefinition>['controllers']
    >().not.toHaveProperty('parameterManager');
  });
});

describe('the static and hydrated states of a commerce engine definition', () => {
  it('should be named after the controllers and the kind of page of the definition', () => {
    expectTypeOf<ListingStaticState>().toEqualTypeOf<
      CommerceStaticState<typeof controllers, SolutionType.listing>
    >();
    expectTypeOf<ListingHydratedState>().toEqualTypeOf<
      CommerceHydratedState<typeof controllers, SolutionType.listing>
    >();
  });

  it('should let code that is generic over the controllers reach the baked-in ones', () => {
    function readBakedInControllers<TControllers extends ControllerDefinitionsMap<Controller>>(
      staticState: CommerceStaticState<TControllers, SolutionType.listing>,
      hydratedState: CommerceHydratedState<TControllers, SolutionType.listing>
    ) {
      expectTypeOf(staticState.controllers.cart).toHaveProperty('state');
      expectTypeOf(hydratedState.controllers.cart).toHaveProperty('empty');
      expectTypeOf(hydratedState.controllers.context).toHaveProperty('state');
      expectTypeOf(hydratedState.controllers.parameterManager).toHaveProperty('synchronize');
    }
    expectTypeOf(readBakedInControllers).toBeFunction();
  });

  it('should keep the baked-in controllers typed when the controllers map is omitted or widened', () => {
    const {listingEngineDefinition: withoutControllers} = defineCommerceEngine({
      configuration: getSampleCommerceEngineConfiguration(),
    });
    type Widened = ControllerDefinitionsMap<Controller>;
    expectTypeOf<
      InferHydratedState<typeof withoutControllers>['controllers']['cart']
    >().toHaveProperty('empty');
    expectTypeOf<
      InferStaticState<typeof withoutControllers>['controllers']['cart']['state']
    >().toHaveProperty('items');
    expectTypeOf<
      CommerceHydratedState<Widened, SolutionType.listing>['controllers']['parameterManager']
    >().toHaveProperty('synchronize');
    expectTypeOf<
      CommerceStaticState<Widened, SolutionType.listing>['controllers']['cart']['state']
    >().toHaveProperty('items');
  });

  it('should name exactly the controllers built for each kind of page', () => {
    expectTypeOf<keyof ListingHydratedState['controllers']>().toEqualTypeOf<
      'productList' | 'parameterManager' | 'context' | 'cart'
    >();
    expectTypeOf<
      keyof InferHydratedState<typeof searchEngineDefinition>['controllers']
    >().toEqualTypeOf<'productList' | 'searchBox' | 'parameterManager' | 'context' | 'cart'>();
    expectTypeOf<
      keyof InferHydratedState<typeof standaloneEngineDefinition>['controllers']
    >().toEqualTypeOf<'context' | 'cart'>();
    expectTypeOf<
      keyof InferHydratedState<typeof recommendationEngineDefinition>['controllers']
    >().toEqualTypeOf<'popularViewed' | 'context' | 'cart'>();
    expectTypeOf<keyof ListingStaticState['controllers']>().toEqualTypeOf<
      keyof ListingHydratedState['controllers']
    >();
  });
});

describe('EngineDefinition', () => {
  // What code written for any engine definition looks like: type parameters constrained to what it
  // reads, inferred from the definition passed in.
  function hydrate<
    TStaticState extends {controllers: object},
    THydratedState extends {engine: unknown; controllers: object},
  >(definition: EngineDefinition<TStaticState, THydratedState>, staticState: TStaticState) {
    return definition.hydrateStaticState(staticState);
  }

  function fetchThenHydrate<
    TStaticState extends {controllers: object},
    THydratedState extends {engine: unknown; controllers: object},
    TFetchOptions,
  >(
    definition: EngineDefinition<TStaticState, THydratedState, TFetchOptions>,
    options: NoInfer<TFetchOptions>
  ) {
    return definition.fetchStaticState(options).then(definition.hydrateStaticState);
  }

  type ListingFetchOptions = Parameters<typeof listingEngineDefinition.fetchStaticState>[0];

  it('should describe every commerce engine definition', () => {
    expectTypeOf(listingEngineDefinition).toExtend<
      EngineDefinition<ListingStaticState, ListingHydratedState, ListingFetchOptions>
    >();
    expectTypeOf(searchEngineDefinition).toExtend<
      EngineDefinition<
        InferStaticState<typeof searchEngineDefinition>,
        InferHydratedState<typeof searchEngineDefinition>,
        Parameters<typeof searchEngineDefinition.fetchStaticState>[0]
      >
    >();
    expectTypeOf(standaloneEngineDefinition).toExtend<
      EngineDefinition<
        InferStaticState<typeof standaloneEngineDefinition>,
        InferHydratedState<typeof standaloneEngineDefinition>,
        Parameters<typeof standaloneEngineDefinition.fetchStaticState>[0]
      >
    >();
    expectTypeOf(recommendationEngineDefinition).toExtend<
      EngineDefinition<
        InferStaticState<typeof recommendationEngineDefinition>,
        InferHydratedState<typeof recommendationEngineDefinition>
      >
    >();
  });

  it('should keep the controllers typed in code written for any engine definition', () => {
    expectTypeOf(
      hydrate(listingEngineDefinition, {} as ListingStaticState)
    ).resolves.toEqualTypeOf<ListingHydratedState>();
    expectTypeOf(
      fetchThenHydrate(listingEngineDefinition, {} as ListingFetchOptions)
    ).resolves.toEqualTypeOf<ListingHydratedState>();
  });

  it('should refuse the static state of another engine definition', () => {
    // @ts-expect-error: a listing static state cannot hydrate the standalone engine definition.
    hydrate(standaloneEngineDefinition, {} as ListingStaticState);
  });

  it('should check the fetch options against the engine definition', () => {
    const navigatorContext = buildMockNavigatorContext();
    const context = {
      language: 'en',
      country: 'US',
      currency: 'USD',
      view: {url: 'https://example.com'},
    } as const;
    fetchThenHydrate(listingEngineDefinition, {navigatorContext, context, searchParams: {page: 2}});
    // @ts-expect-error: the context is missing.
    fetchThenHydrate(listingEngineDefinition, {navigatorContext});
    // @ts-expect-error: searchParams is misspelled.
    fetchThenHydrate(listingEngineDefinition, {navigatorContext, context, serachParams: {page: 2}});
  });
});

import type {Middleware, UnknownAction} from '@reduxjs/toolkit';
import type {SearchResponseSuccess} from '../../../api/search/search/search-response.js';
import type {LoggerOptions} from '../../../app/logger.js';
import {getSampleSearchEngineConfiguration} from '../../../app/search-engine/search-engine.js';
import {
  buildController,
  type Controller,
} from '../../../controllers/controller/headless-controller.js';
import type {executeSearch} from '../../../features/search/search-actions.js';
import {buildMockNavigatorContextProvider} from '../../../test/mock-navigator-context-provider.js';
import {buildMockResult} from '../../../test/mock-result.js';
import * as augmentModule from '../../common/augment-preprocess-request.js';
import type {ControllerDefinitionWithoutProps} from '../../common/types/controllers.js';
import type {
  InferHydratedState,
  InferStaticState,
} from '../../common/types/engine.js';
import {defineContext} from '../controllers/context/headless-context.ssr.js';
import {defineResultList} from '../controllers/result-list/headless-result-list.ssr.js';
import {
  defineSearchEngine,
  type SearchEngineDefinition,
  type SSRSearchEngine,
} from './search-engine.ssr.js';

interface CustomEngineStateReader<TState extends {}> extends Controller {
  state: TState;
}

type UnknownActionWithPossibleSearchResponsePayload = UnknownAction & {
  payload: {
    response: SearchResponseSuccess;
  };
  meta: {requestId: string};
};

function defineCustomEngineStateReader(): ControllerDefinitionWithoutProps<
  SSRSearchEngine,
  CustomEngineStateReader<SSRSearchEngine['state']>
> {
  return {
    build(engine) {
      return {
        ...buildController(engine),
        get state() {
          return engine.state;
        },
      };
    },
  };
}

function isSearchPendingAction(
  action: UnknownAction
): action is ReturnType<(typeof executeSearch)['pending']> {
  return action.type === 'search/executeSearch/pending';
}

function isSearchFulfilledAction(
  action: UnknownAction
): action is ReturnType<(typeof executeSearch)['fulfilled']> {
  return action.type === 'search/executeSearch/fulfilled';
}

function createMockResultsMiddleware(options: {
  defaultNumberOfResults: number;
}): Middleware {
  const numberOfResultsPerRequestId: {[requestId: string]: number | undefined} =
    {};
  return (api) => (next) => (action) => {
    const possibleSearchActionWithPayload =
      action as UnknownActionWithPossibleSearchResponsePayload;
    if (isSearchPendingAction(possibleSearchActionWithPayload)) {
      const state = api.getState() as SSRSearchEngine['state'];
      numberOfResultsPerRequestId[
        possibleSearchActionWithPayload.meta.requestId
      ] = state.pagination?.numberOfResults ?? options.defaultNumberOfResults;
      return next(action);
    }
    if (isSearchFulfilledAction(action as UnknownAction)) {
      const newAction = JSON.parse(
        JSON.stringify(possibleSearchActionWithPayload)
      ) as UnknownActionWithPossibleSearchResponsePayload;
      newAction.payload.response.results = Array.from(
        {
          length:
            numberOfResultsPerRequestId[
              possibleSearchActionWithPayload.meta.requestId
            ]!,
        },
        (_, index) => buildMockResult({title: `Result #${index}`})
      );
      return next(newAction);
    }
    return next(action);
  };
}

describe('SSR', () => {
  const mockNavigatorContextProvider = buildMockNavigatorContextProvider();
  const mockPreprocessRequest = vi.fn(async (req) => req);

  describe('define search engine', () => {
    type StaticState = InferStaticState<typeof engineDefinition>;
    type HydratedState = InferHydratedState<typeof engineDefinition>;
    type AnyState = StaticState | HydratedState;

    const defaultNumberOfResults = 12;
    let engineDefinition: SearchEngineDefinition<{
      engineStateReader: ReturnType<typeof defineCustomEngineStateReader>;
      resultList: ReturnType<typeof defineResultList>;
      context: ReturnType<typeof defineContext>;
    }>;

    function getResultsPerPage(state: AnyState) {
      return (
        state.controllers.engineStateReader.state.pagination?.numberOfResults ??
        defaultNumberOfResults
      );
    }

    beforeEach(() => {
      engineDefinition = defineSearchEngine({
        configuration: {
          ...getSampleSearchEngineConfiguration(),
          analytics: {enabled: false},
          preprocessRequest: mockPreprocessRequest,
        },
        controllers: {
          engineStateReader: defineCustomEngineStateReader(),
          resultList: defineResultList(),
          context: defineContext(),
        },
        navigatorContextProvider: mockNavigatorContextProvider,
        loggerOptions: {level: 'warn'} as LoggerOptions,
        middlewares: [createMockResultsMiddleware({defaultNumberOfResults})],
      });
    });

    it('returns 2 functions (where two are composite)', () => {
      const {fetchStaticState, hydrateStaticState} = engineDefinition;
      expect(typeof fetchStaticState).toBe('function');
      expect(typeof hydrateStaticState).toBe('function');
    });

    it('fetches initial state of engine', async () => {
      const staticState = await engineDefinition.fetchStaticState({
        controllers: {
          context: {
            initialState: {
              values: {
                foo: 'bar',
              },
            },
          },
        },
      });
      expect(staticState).toBeTruthy();
      expect(getResultsPerPage(staticState)).toBe(defaultNumberOfResults);
    });

    // TODO: find a way to make the test cleaner. instead of having to call existing controller. create mock controllers and fixtures
    it('should return the context controller static with the `initialState` property', async () => {
      const staticState = await engineDefinition.fetchStaticState({
        controllers: {
          context: {
            initialState: {
              values: {
                foo: 'bar',
              },
            },
          },
        },
      });
      // Controllers with props should have an initialState property
      expect(staticState.controllers.context.initialState).toEqual({
        values: {
          foo: 'bar',
        },
      });

      // Other Controllers should not have an initialState property
      expect(Object.keys(staticState.controllers.resultList)).not.toContain(
        'initialState'
      );
    });

    it('should call augmentPreprocessRequestWithForwardedFor when fetchStaticState is invoked', async () => {
      const spy = vi.spyOn(
        augmentModule,
        'augmentPreprocessRequestWithForwardedFor'
      );

      await engineDefinition.fetchStaticState({
        controllers: {
          context: {
            initialState: {
              values: {
                foo: 'bar',
              },
            },
          },
        },
      });
      expect(spy).toHaveBeenCalledWith({
        loggerOptions: {level: 'warn'},
        navigatorContextProvider: mockNavigatorContextProvider,
        preprocessRequest: mockPreprocessRequest,
      });

      spy.mockRestore();
    });

    describe('with a static state', () => {
      let staticState: StaticState;
      beforeEach(async () => {
        staticState = await engineDefinition.fetchStaticState({
          controllers: {
            context: {
              initialState: {
                values: {
                  foo: 'bar',
                },
              },
            },
          },
        });
      });

      it('hydrates engine', async () => {
        const hydratedState =
          await engineDefinition.hydrateStaticState(staticState);
        expect(hydratedState.engine.state.configuration.organizationId).toEqual(
          getSampleSearchEngineConfiguration().organizationId
        );
        expect(getResultsPerPage(hydratedState)).toBe(defaultNumberOfResults);
      });
    });
  });
});

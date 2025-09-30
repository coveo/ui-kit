import type {Middleware, UnknownAction} from '@reduxjs/toolkit';
import type {SearchResponseSuccess} from '../../../api/search/search/search-response.js';
import type {LoggerOptions} from '../../../app/logger.js';
import {getSampleSearchEngineConfiguration} from '../../../app/search-engine/search-engine.js';
import {
  buildController,
  type Controller,
} from '../../../controllers/controller/headless-controller.js';
import type {executeSearch} from '../../../features/search/search-actions.js';
import {buildMockResult} from '../../../test/mock-result.js';
import * as augmentModule from '../../common/augment-preprocess-request.js';
import type {
  InferHydratedState,
  InferStaticState,
} from '../../common/types/engine.js';
import {defineResultList} from '../controllers/result-list/headless-result-list.ssr.js';
import type {ControllerDefinitionWithoutProps} from '../types/controller-definition.js';
import type {SearchEngineDefinition} from '../types/engine.js';
import {defineSearchEngine, type SSRSearchEngine} from './search-engine.ssr.js';

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
    const unknownAction = action as UnknownAction;
    if (isSearchPendingAction(unknownAction)) {
      const state = api.getState() as SSRSearchEngine['state'];
      numberOfResultsPerRequestId[unknownAction.meta.requestId] =
        state.pagination?.numberOfResults ?? options.defaultNumberOfResults;
      return next(action);
    }
    if (isSearchFulfilledAction(unknownAction)) {
      const searchAction =
        unknownAction as UnknownActionWithPossibleSearchResponsePayload;
      const newAction = JSON.parse(
        JSON.stringify(searchAction)
      ) as UnknownActionWithPossibleSearchResponsePayload;
      newAction.payload.response.results = Array.from(
        {
          length: numberOfResultsPerRequestId[searchAction.meta.requestId]!,
        },
        (_, index) => buildMockResult({title: `Result #${index}`})
      );
      return next(newAction);
    }
    return next(action);
  };
}

describe('SSR', () => {
  const mockPreprocessRequest = vi.fn(async (req) => req);
  const mockNavigatorContext = {
    forwardedFor: '192.168.1.1',
    referrer: 'https://example.com',
    userAgent: 'test-agent',
    location: '/test',
    clientId: 'test-client',
  };

  describe('define search engine', () => {
    type StaticState = InferStaticState<typeof engineDefinition>;
    type HydratedState = InferHydratedState<typeof engineDefinition>;
    type AnyState = StaticState | HydratedState;

    const defaultNumberOfResults = 12;
    let engineDefinition: SearchEngineDefinition<
      SSRSearchEngine,
      {
        engineStateReader: ReturnType<typeof defineCustomEngineStateReader>;
        resultList: ReturnType<typeof defineResultList>;
      }
    >;

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
        },
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
      const fetchStaticState = vi.mocked(engineDefinition.fetchStaticState);
      const staticState = await fetchStaticState({
        navigatorContext: mockNavigatorContext,
      });
      expect(staticState).toBeTruthy();
      expect(getResultsPerPage(staticState)).toBe(defaultNumberOfResults);
    });

    it('should call augmentPreprocessRequestWithForwardedFor when fetchStaticState is invoked with navigatorContext', async () => {
      const spy = vi.spyOn(
        augmentModule,
        'augmentPreprocessRequestWithForwardedFor'
      );

      const fetchStaticState = engineDefinition.fetchStaticState;
      await fetchStaticState({
        navigatorContext: mockNavigatorContext,
      });
      expect(spy).toHaveBeenCalledWith({
        loggerOptions: {level: 'warn'},
        navigatorContext: mockNavigatorContext,
        preprocessRequest: mockPreprocessRequest,
      });

      spy.mockRestore();
    });

    describe('with a static state', () => {
      let staticState: StaticState;
      beforeEach(async () => {
        const fetchStaticState = vi.mocked(engineDefinition.fetchStaticState);
        staticState = await fetchStaticState({
          navigatorContext: mockNavigatorContext,
        });
      });

      it('hydrates engine', async () => {
        const hydrateStaticState = vi.mocked(
          engineDefinition.hydrateStaticState
        );
        const hydratedState = await hydrateStaticState(staticState);
        expect(hydratedState.engine.state.configuration.organizationId).toEqual(
          getSampleSearchEngineConfiguration().organizationId
        );
        expect(getResultsPerPage(hydratedState)).toBe(defaultNumberOfResults);
      });
    });
  });
});

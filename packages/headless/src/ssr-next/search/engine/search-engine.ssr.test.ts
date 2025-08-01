import type {Middleware, UnknownAction} from '@reduxjs/toolkit';
import type {SearchResponseSuccess} from '../../../api/search/search/search-response.js';
import type {LoggerOptions} from '../../../app/logger.js';
import {getSampleSearchEngineConfiguration} from '../../../app/search-engine/search-engine.js';
import {
  buildController,
  type Controller,
} from '../../../controllers/controller/headless-controller.js';
import {loadPaginationActions} from '../../../features/pagination/pagination-actions-loader.js';
import type {executeSearch} from '../../../features/search/search-actions.js';
import {buildMockNavigatorContextProvider} from '../../../test/mock-navigator-context-provider.js';
import {buildMockResult} from '../../../test/mock-result.js';
import * as augmentModule from '../../common/augment-preprocess-request.js';
import type {ControllerDefinitionWithoutProps} from '../../common/types/controllers.js';
import type {
  InferBuildResult,
  InferHydratedState,
  InferStaticState,
} from '../../common/types/engine.js';
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
    type BuildResult = InferBuildResult<typeof engineDefinition>;
    type AnyState = StaticState | HydratedState | BuildResult;

    const defaultNumberOfResults = 12;
    let engineDefinition: SearchEngineDefinition<{
      engineStateReader: ReturnType<typeof defineCustomEngineStateReader>;
      resultList: ReturnType<typeof defineResultList>;
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
        },
        navigatorContextProvider: mockNavigatorContextProvider,
        loggerOptions: {level: 'warn'} as LoggerOptions,
        middlewares: [createMockResultsMiddleware({defaultNumberOfResults})],
      });
    });

    it('returns 3 functions (where two are composite)', () => {
      const {build, fetchStaticState, hydrateStaticState} = engineDefinition;
      expect(typeof build).toBe('function');
      expect(typeof fetchStaticState).toBe('function');
      expect(typeof hydrateStaticState).toBe('function');
      expect(typeof fetchStaticState.fromBuildResult).toBe('function');
      expect(typeof hydrateStaticState.fromBuildResult).toBe('function');
    });

    it('gets build result', async () => {
      const {build} = engineDefinition;
      const buildResult = await build();
      expect(buildResult.engine).toBeTruthy();
      expect(buildResult.controllers).toBeTruthy();
    });

    it('fetches initial state of engine', async () => {
      const fetchStaticState = vi.mocked(engineDefinition.fetchStaticState);
      const staticState = await fetchStaticState();
      expect(staticState).toBeTruthy();
      expect(getResultsPerPage(staticState)).toBe(defaultNumberOfResults);
    });

    it('should call augmentPreprocessRequestWithForwardedFor when fetchStaticState is invoked', async () => {
      const spy = vi.spyOn(
        augmentModule,
        'augmentPreprocessRequestWithForwardedFor'
      );

      const fetchStaticState = engineDefinition.fetchStaticState;
      await fetchStaticState();
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
        const fetchStaticState = vi.mocked(engineDefinition.fetchStaticState);
        staticState = await fetchStaticState();
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

    describe('with a buildResult that has a customized numberOfResults', () => {
      const newNumberOfResults = 6;

      async function fetchBuildResultWithNewNumberOfResults() {
        const build = vi.mocked(engineDefinition.build);
        const buildResult = await build();
        const {registerNumberOfResults} = loadPaginationActions(
          buildResult.engine
        );
        buildResult.engine.dispatch(
          registerNumberOfResults(newNumberOfResults)
        );
        expect(getResultsPerPage(buildResult)).toBe(newNumberOfResults);
        return buildResult;
      }

      it('fetches initial state of engine from build result', async () => {
        const fetchStaticState = vi.mocked(engineDefinition.fetchStaticState);
        const staticState = await fetchStaticState.fromBuildResult({
          buildResult: await fetchBuildResultWithNewNumberOfResults(),
        });
        expect(staticState).toBeTruthy();
        expect(getResultsPerPage(staticState)).toBe(newNumberOfResults);
      });

      describe('with the default static state', () => {
        let staticState: StaticState;
        beforeEach(async () => {
          const fetchStaticState = vi.mocked(engineDefinition.fetchStaticState);
          staticState = await fetchStaticState();
        });

        it('hydrates engine from build result', async () => {
          const hydrateStaticState = vi.mocked(
            engineDefinition.hydrateStaticState
          );
          const buildResult = await fetchBuildResultWithNewNumberOfResults();
          const hydratedState = await hydrateStaticState.fromBuildResult({
            buildResult: buildResult,
            searchAction: staticState.searchAction,
          });
          expect(getResultsPerPage(hydratedState)).toBe(newNumberOfResults);
        });
      });
    });
  });
});

import {Middleware, UnknownAction} from '@reduxjs/toolkit';
import {SearchResponseSuccess} from '../../api/search/search/search-response.js';
import {
  buildController,
  Controller,
} from '../../controllers/controller/headless-controller.js';
import {defineResultList} from '../../controllers/result-list/headless-result-list.ssr.js';
import {loadPaginationActions} from '../../features/pagination/pagination-actions-loader.js';
import {executeSearch} from '../../features/search/search-actions.js';
import {buildMockResult} from '../../test/mock-result.js';
import {ControllerDefinitionWithoutProps} from '../ssr-engine/types/common.js';
import {InferHydratedState} from '../ssr-engine/types/core-engine.js';
import {InferStaticState} from '../ssr-engine/types/core-engine.js';
import {InferBuildResult} from '../ssr-engine/types/core-engine.js';
import {getSampleSearchEngineConfiguration} from './search-engine.js';
import {
  SSRSearchEngine,
  SearchEngineDefinition,
  defineSearchEngine,
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
        possibleSearchActionWithPayload['meta']['requestId']
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

    function getResultsCount(state: AnyState) {
      return state.controllers.resultList.state.results.length;
    }

    beforeEach(() => {
      engineDefinition = defineSearchEngine({
        configuration: {
          ...getSampleSearchEngineConfiguration(),
          analytics: {enabled: false},
        },
        controllers: {
          engineStateReader: defineCustomEngineStateReader(),
          resultList: defineResultList(),
        },
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
      const {fetchStaticState} = engineDefinition;
      const staticState = await fetchStaticState();
      expect(staticState).toBeTruthy();
      expect(getResultsCount(staticState)).toBe(defaultNumberOfResults);
      expect(getResultsPerPage(staticState)).toBe(defaultNumberOfResults);
    });

    describe('with a static state', () => {
      let staticState: StaticState;
      beforeEach(async () => {
        const {fetchStaticState} = engineDefinition;
        staticState = await fetchStaticState();
      });

      it('hydrates engine and fetches results using hydrated engine', async () => {
        const {hydrateStaticState} = engineDefinition;
        const hydratedState = await hydrateStaticState(staticState);
        expect(hydratedState.engine.state.configuration.organizationId).toEqual(
          getSampleSearchEngineConfiguration().organizationId
        );
        expect(getResultsCount(hydratedState)).toBe(defaultNumberOfResults);
        expect(getResultsPerPage(hydratedState)).toBe(defaultNumberOfResults);
      });
    });

    describe('with a buildResult that has a customized numberOfResults', () => {
      const newNumberOfResults = 6;

      async function fetchBuildResultWithNewNumberOfResults() {
        const {build} = engineDefinition;
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
        const {fetchStaticState} = engineDefinition;
        const staticState = await fetchStaticState.fromBuildResult({
          buildResult: await fetchBuildResultWithNewNumberOfResults(),
        });
        expect(staticState).toBeTruthy();
        expect(getResultsCount(staticState)).toBe(newNumberOfResults);
        expect(getResultsPerPage(staticState)).toBe(newNumberOfResults);
      });

      describe('with the default static state', () => {
        let staticState: StaticState;
        beforeEach(async () => {
          const {fetchStaticState} = engineDefinition;
          staticState = await fetchStaticState();
        });

        it('hydrates engine from build result', async () => {
          const {hydrateStaticState} = engineDefinition;
          const buildResult = await fetchBuildResultWithNewNumberOfResults();
          const hydratedState = await hydrateStaticState.fromBuildResult({
            buildResult: buildResult,
            searchAction: staticState.searchAction,
          });
          expect(getResultsCount(staticState)).toBe(defaultNumberOfResults);
          expect(getResultsCount(hydratedState)).toBe(
            getResultsCount(staticState)
          );
          expect(getResultsPerPage(hydratedState)).toBe(newNumberOfResults);
        });
      });
    });
  });
});

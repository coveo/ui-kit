import {getSampleSearchEngineConfiguration} from '../../../app/search-engine/search-engine-configuration.js';
import {logSearchEvent} from '../../../features/analytics/analytics-actions.js';
import {executeSearch} from '../../../features/search/search-actions.js';
import {buildMockNavigatorContextProvider} from '../../../test/mock-navigator-context-provider.js';
import {buildMockSearch} from '../../../test/mock-search.js';
import {buildMockSearchResponse} from '../../../test/mock-search-response.js';
import {defineMockControllerWithoutProps} from '../../common/tests/fixtures/controllerWithoutProps.js';
import {defineMockControllerWithProps} from '../../common/tests/fixtures/controllerWithProps.js';
import {hydratedStaticStateFactory} from '../factories/hydrated-state-factory.js';
import {fetchStaticStateFactory} from '../factories/static-state-factory.js';
import {defineSearchEngine} from './search-engine.ssr.js';

vi.mock('../factories/static-state-factory.js', {spy: true});
vi.mock('../factories/hydrated-state-factory.js', {spy: true});

describe('SSR', () => {
  type EngineDefinition = ReturnType<
    typeof defineSearchEngine<ReturnType<typeof getMockControllers>>
  >;
  const getMockControllers = () => ({
    controllerWithProps: defineMockControllerWithProps(),
    controllerWithoutProps: defineMockControllerWithoutProps(),
  });

  let engineDefinition: EngineDefinition;
  let mockControllers: ReturnType<typeof getMockControllers>;
  let mockNavigatorContextProvider: ReturnType<
    typeof buildMockNavigatorContextProvider
  >;

  beforeEach(() => {
    mockNavigatorContextProvider = buildMockNavigatorContextProvider(); // TODO: change to fit the rest
    mockControllers = getMockControllers();

    const engineConfig = {
      configuration: {
        ...getSampleSearchEngineConfiguration(),
        analytics: {enabled: false},
        // preprocessRequest: mockPreprocessRequest, // TODO: not sure it is needed here
      },
      controllers: mockControllers,
      navigatorContextProvider: mockNavigatorContextProvider,
    };

    // const mockEngine = buildMockSSRSearchEngine(createMockState());

    engineDefinition = defineSearchEngine(engineConfig);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should return an object with fetchStaticState and hydrateStaticState as functions', () => {
    expect(typeof engineDefinition.fetchStaticState).toBe('function');
    expect(typeof engineDefinition.hydrateStaticState).toBe('function');
  });

  it('should call #fetchStaticStateFactory once ', () => {
    const mockedFetchStaticStateFactory = vi.mocked(fetchStaticStateFactory);
    expect(mockedFetchStaticStateFactory).toHaveBeenCalledOnce();
  });

  it('should call #hydrateStaticStateFactory once ', () => {
    const mockedHydrateStaticStateFactory = vi.mocked(
      hydratedStaticStateFactory
    );
    expect(mockedHydrateStaticStateFactory).toHaveBeenCalledOnce();
  });

  it('should call #fetchStaticStateFactory with the correct parameters', () => {
    const mockedFetchStaticStateFactory = vi.mocked(fetchStaticStateFactory);
    const controllers = mockedFetchStaticStateFactory.mock.calls[0][0];
    expect(controllers).toStrictEqual(mockControllers);
  });

  it('should call #hydratedStaticStateFactory with the correct parameters', () => {
    const mockedHydrateStaticStateFactory = vi.mocked(
      hydratedStaticStateFactory
    );
    const controllers = mockedHydrateStaticStateFactory.mock.calls[0][0];
    expect(controllers).toStrictEqual(mockControllers);
  });

  // TODO: should be moved to hydrateStaticState tests
  it('should accept', async () => {
    const mockBuildWithProps = vi.fn().mockReturnValue({state: vi.fn()});

    const {fetchStaticState, hydrateStaticState} = defineSearchEngine({
      configuration: {
        ...getSampleSearchEngineConfiguration(),
      },
      controllers: {
        controllerWithProps: defineMockControllerWithProps({
          buildWithProps: mockBuildWithProps,
        }),
      },
    });

    const staticState = await fetchStaticState({
      controllers: {
        controllerWithProps: {
          foo: 'bar',
        },
      },
    });

    const searchAction = executeSearch.fulfilled(
      buildMockSearch({
        response: buildMockSearchResponse({
          queryCorrection: {
            originalQuery: 'foo',
            correctedQuery: 'bar',
            corrections: [],
          },
        }),
      }),
      '',
      {legacy: logSearchEvent({evt: 'foo'})}
    );

    await hydrateStaticState({
      controllers: staticState.controllers,
      searchAction,
    });

    expect(mockBuildWithProps).toHaveBeenCalledWith(
      expect.anything(), // The engine instance
      expect.objectContaining({
        foo: 'bar',
      })
    );
  });

  // TODO: should be moved to fetchStaticState tests
  it("should forward provided controller props to the controller's buildWithProps in fetchStaticState", async () => {
    const mockBuildWithProps = vi.fn().mockReturnValue({state: vi.fn()});

    const {fetchStaticState} = defineSearchEngine({
      configuration: {
        ...getSampleSearchEngineConfiguration(),
      },
      controllers: {
        controllerWithProps: defineMockControllerWithProps({
          buildWithProps: mockBuildWithProps,
        }),
      },
    });

    await fetchStaticState({
      controllers: {
        controllerWithProps: {
          foo: 'bar',
        },
      },
    });

    expect(mockBuildWithProps).toHaveBeenCalledWith(
      expect.anything(), // The engine instance
      expect.objectContaining({
        foo: 'bar',
      })
    );
  });
});

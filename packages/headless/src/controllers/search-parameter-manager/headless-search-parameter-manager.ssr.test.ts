import {SSRSearchEngine} from '../../app/search-engine/search-engine.ssr';
import {ControllerDefinitionWithProps} from '../../app/ssr-engine/types/common';
import {buildMockSSRSearchEngine} from '../../test/mock-engine';
import {
  SearchParameterManager,
  buildSearchParameterManager,
} from './headless-search-parameter-manager';
import {
  SearchParameterManagerBuildProps,
  defineSearchParameterManager,
} from './headless-search-parameter-manager.ssr';

jest.mock('./headless-search-parameter-manager');
const buildSearchParameterManagerMock = jest.mocked(
  buildSearchParameterManager
);

type SearchParameterManagerDefinitionType = ControllerDefinitionWithProps<
  SSRSearchEngine,
  SearchParameterManager,
  SearchParameterManagerBuildProps
>;

describe('define search parameter manager', () => {
  let searchParameterManagerDefinition: SearchParameterManagerDefinitionType;

  beforeEach(() => {
    searchParameterManagerDefinition = defineSearchParameterManager();
    buildSearchParameterManagerMock.mockClear();
  });

  it('defineSearchParameterManager returns the proper type', () => {
    expect(
      searchParameterManagerDefinition
    ).toMatchObject<SearchParameterManagerDefinitionType>({
      buildWithProps: expect.any(Function),
    });
  });

  it("buildWithProps should pass it's parameters to the buildSearchParameterManager", () => {
    const engine: SSRSearchEngine = buildMockSSRSearchEngine();
    const props: SearchParameterManagerBuildProps =
      {} as unknown as SearchParameterManagerBuildProps;

    searchParameterManagerDefinition.buildWithProps(engine, {
      initialState: props.initialState,
    });

    expect(buildSearchParameterManagerMock).toBeCalledWith(engine, props);
  });
});

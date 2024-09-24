import {SSRSearchEngine} from '../../app/search-engine/search-engine.ssr.js';
import {ControllerDefinitionWithProps} from '../../app/ssr-engine/types/common.js';
import {buildMockSSRSearchEngine} from '../../test/mock-engine-v2.js';
import {createMockState} from '../../test/mock-state.js';
import {Context, buildContext} from './headless-context.js';
import {ContextProps, defineContext} from './headless-context.ssr.js';

vi.mock('./headless-context');
const buildContextMock = vi.mocked(buildContext);

type contextDefinitionType = ControllerDefinitionWithProps<
  SSRSearchEngine,
  Context,
  ContextProps
>;

describe('define context', () => {
  let contextDefinition: contextDefinitionType;

  beforeEach(() => {
    contextDefinition = defineContext();
    buildContextMock.mockClear();
  });

  it('defineContext returns the proper type', () => {
    expect(contextDefinition).toMatchObject<contextDefinitionType>({
      buildWithProps: expect.any(Function),
    });
  });

  it("buildWithProps should pass it's parameters to the buildContext", () => {
    const engine: SSRSearchEngine = buildMockSSRSearchEngine(createMockState());
    const props: ContextProps = {} as unknown as ContextProps;

    contextDefinition.buildWithProps(engine, {
      initialState: props.initialState,
    });

    expect(buildContextMock).toBeCalledWith(engine, props);
  });
});

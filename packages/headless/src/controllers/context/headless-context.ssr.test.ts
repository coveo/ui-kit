import {SSRSearchEngine} from '../../app/search-engine/search-engine.ssr';
import {ControllerDefinitionWithProps} from '../../app/ssr-engine/types/common';
import {buildMockSSRSearchEngine} from '../../test/mock-engine-v2';
import {createMockState} from '../../test/mock-state';
import {Context, buildContext} from './headless-context';
import {ContextProps, defineContext} from './headless-context.ssr';

jest.mock('./headless-context');
const buildContextMock = jest.mocked(buildContext);

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

import {SSRSearchEngine} from '../../app/search-engine/search-engine.ssr.js';
import {buildMockSSRSearchEngine} from '../../test/mock-engine-v2.js';
import {createMockState} from '../../test/mock-state.js';
import {MissingControllerProps} from '../../utils/errors.js';
import {buildContext} from './headless-context.js';
import {
  ContextDefinition,
  ContextProps,
  defineContext,
} from './headless-context.ssr.js';

vi.mock('./headless-context');
const buildContextMock = vi.mocked(buildContext);

describe('define context', () => {
  let contextDefinition: ContextDefinition;

  beforeEach(() => {
    contextDefinition = defineContext();
    buildContextMock.mockClear();
  });

  it('defineContext returns the proper type', () => {
    expect(contextDefinition).toMatchObject<ContextDefinition>({
      buildWithProps: expect.any(Function),
    });
  });

  it('buildWithProps should pass its parameters to the buildContext', () => {
    const engine: SSRSearchEngine = buildMockSSRSearchEngine(createMockState());
    const props: ContextProps = {} as unknown as ContextProps;

    contextDefinition.buildWithProps(engine, {
      initialState: props.initialState,
    });

    expect(buildContextMock).toBeCalledWith(engine, props);
  });

  it('should throw when props is undefined', () => {
    const engine: SSRSearchEngine = buildMockSSRSearchEngine(createMockState());
    const props: ContextProps = undefined as unknown as ContextProps;

    expect(() => {
      contextDefinition.buildWithProps(engine, props);
    }).toThrow(MissingControllerProps);
  });
});

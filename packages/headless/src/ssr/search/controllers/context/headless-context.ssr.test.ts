import {buildContext} from '../../../../controllers/context/headless-context.js';
import {buildMockSSRSearchEngine} from '../../../../test/mock-engine-v2.js';
import {createMockState} from '../../../../test/mock-state.js';
import {MissingControllerProps} from '../../../common/errors.js';
import type {SSRSearchEngine} from '../../engine/search-engine.ssr.js';
import {
  type ContextDefinition,
  type ContextProps,
  defineContext,
} from './headless-context.ssr.js';

vi.mock('../../../../controllers/context/headless-context.js');
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

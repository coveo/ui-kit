import {
  buildContext,
  type Context,
  type ContextOptions,
} from '../../../../controllers/commerce/context/headless-context.js';
import {buildMockCommerceState} from '../../../../test/mock-commerce-state.js';
import {buildMockSSRCommerceEngine} from '../../../../test/mock-engine-v2.js';
import {MissingControllerProps} from '../../../common/errors.js';
import type {SSRCommerceEngine} from '../../factories/build-factory.js';
import {type ContextDefinition, defineContext} from './headless-context.ssr.js';

vi.mock('../../../../controllers/commerce/context/headless-context.js');
const buildContextMock = vi.mocked(buildContext);

describe('define commerce context', () => {
  const options: ContextOptions = {
    language: 'en',
    country: 'us',
    currency: 'USD',
    view: {
      url: 'https://example.org',
    },
  };
  let contextDefinition: ContextDefinition;

  beforeEach(() => {
    buildContextMock.mockReturnValue({} as Context);
    contextDefinition = defineContext();
  });

  afterEach(() => {
    buildContextMock.mockClear();
  });

  it('defineContext returns the proper type', () => {
    expect(contextDefinition).toMatchObject<ContextDefinition>({
      buildWithProps: expect.any(Function),
      listing: true,
      search: true,
      standalone: true,
      recommendation: true,
    });
  });

  it('buildWithProps should pass its parameters to the buildContext', () => {
    const engine: SSRCommerceEngine = buildMockSSRCommerceEngine({
      ...buildMockCommerceState(),
      commerceContext: {...options},
    });

    contextDefinition.buildWithProps(engine, options);

    expect(buildContextMock).toBeCalledWith(engine, {options});
  });

  it('should throw when props is undefined', () => {
    const engine: SSRCommerceEngine = buildMockSSRCommerceEngine({
      ...buildMockCommerceState(),
      commerceContext: {...options},
    });
    const props = undefined as unknown as ContextOptions;

    expect(() => {
      contextDefinition.buildWithProps(engine, props);
    }).toThrow(MissingControllerProps);
  });
});

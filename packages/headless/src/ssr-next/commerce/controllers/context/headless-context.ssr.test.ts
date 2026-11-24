import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import {
  buildContext,
  type Context,
  type ContextOptions,
} from '../../../../controllers/commerce/context/headless-context.js';
import {buildMockCommerceState} from '../../../../test/mock-commerce-state.js';
import {buildMockSSRCommerceEngine} from '../../../../test/mock-engine-v2.js';
import {buildMockCommerceBuildContext} from '../../../../test/mock-ssr-build-context.js';
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
    custom: {
      key1: 'value',
      key2: 42,
      key3: {
        nestedKey: true,
      },
      key4: [1, 2, 3],
    },
  };
  let contextDefinition: ContextDefinition;
  let engine: SSRCommerceEngine;

  beforeEach(() => {
    buildContextMock.mockReturnValue({} as Context);
    contextDefinition = defineContext();
    engine = buildMockSSRCommerceEngine({
      ...buildMockCommerceState(),
      commerceContext: {...options},
    });
  });

  afterEach(() => {
    buildContextMock.mockClear();
  });

  it('should return a definition available on every kind of page', () => {
    expect(contextDefinition).toMatchObject<ContextDefinition>({
      build: expect.any(Function),
      listing: true,
      search: true,
      standalone: true,
    });
  });

  it('should build the context with the context passed to fetchStaticState()', () => {
    contextDefinition.build(
      engine,
      buildMockCommerceBuildContext({buildConfig: {context: options}})
    );

    expect(buildContextMock).toHaveBeenCalledWith(engine, {options});
  });
});

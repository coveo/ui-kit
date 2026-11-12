import {beforeEach, describe, expect, it, vi} from 'vitest';
import {buildContext} from '../../../../controllers/context/headless-context.js';
import {buildMockSSRSearchEngine} from '../../../../test/mock-engine-v2.js';
import {buildMockNavigatorContext} from '../../../../test/mock-navigator-context.js';
import {createMockState} from '../../../../test/mock-state.js';
import type {SSRSearchEngine} from '../../types/build.js';
import {type ContextDefinition, defineContext} from './headless-context.ssr.js';

vi.mock('../../../../controllers/context/headless-context.js');
const buildContextMock = vi.mocked(buildContext);

describe('define context', () => {
  let contextDefinition: ContextDefinition;
  let engine: SSRSearchEngine;

  beforeEach(() => {
    contextDefinition = defineContext();
    engine = buildMockSSRSearchEngine(createMockState());
    buildContextMock.mockClear();
  });

  it('should return a definition with a build function', () => {
    expect(contextDefinition).toMatchObject<ContextDefinition>({
      build: expect.any(Function),
    });
  });

  it('should build the context with the custom context values passed to fetchStaticState()', () => {
    contextDefinition.build(engine, {
      buildConfig: {navigatorContext: buildMockNavigatorContext(), context: {ageGroup: '30-45'}},
    });

    expect(buildContextMock).toHaveBeenCalledWith(engine, {
      initialState: {values: {ageGroup: '30-45'}},
    });
  });

  it('should build the context with no values when the request carries none', () => {
    contextDefinition.build(engine, {buildConfig: {navigatorContext: buildMockNavigatorContext()}});

    expect(buildContextMock).toHaveBeenCalledWith(engine, {initialState: {values: {}}});
  });
});

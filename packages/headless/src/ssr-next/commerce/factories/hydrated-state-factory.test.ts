import {beforeEach, describe, expect, it, vi} from 'vitest';
import {getSampleCommerceEngineConfiguration} from '../../../app/commerce-engine/commerce-engine-configuration.js';
import {buildMockNavigatorContext} from '../../../test/mock-navigator-context.js';
import {defineCart} from '../controllers/cart/headless-cart.ssr.js';
import {defineContext} from '../controllers/context/headless-context.ssr.js';
import {defineParameterManager} from '../controllers/parameter-manager/headless-core-parameter-manager.ssr.js';
import {SolutionType} from '../types/controller-constants.js';
import type {HydrateStaticStateParameters} from '../types/engine.js';
import {buildFactory} from './build-factory.js';
import {hydratedStaticStateFactory} from './hydrated-state-factory.js';

vi.mock('./build-factory.js');

describe('hydratedStaticStateFactory', () => {
  const controllerDefinitions = {
    parameterManager: defineParameterManager(),
    context: defineContext(),
    cart: defineCart(),
  };
  const options = {configuration: getSampleCommerceEngineConfiguration()};

  const engine = {
    dispatch: vi.fn(),
    waitForRequestCompletedAction: vi.fn(),
  };
  const mockBuildResult = {engine, controllers: {}};
  const flushMicrotasks = () => new Promise((resolve) => setTimeout(resolve, 0));

  let mockSolutionTypeBuild: ReturnType<typeof vi.fn>;

  const params = {
    navigatorContext: buildMockNavigatorContext(),
    context: {language: 'en', country: 'US', currency: 'USD', view: {url: 'https://example.com'}},
    searchActions: [{type: 'commerce/productListing/fetch/fulfilled'}],
  } as unknown as HydrateStaticStateParameters<typeof controllerDefinitions, SolutionType.listing>;

  beforeEach(() => {
    vi.clearAllMocks();
    engine.waitForRequestCompletedAction.mockReturnValue([Promise.resolve({type: 'some-action'})]);
    mockSolutionTypeBuild = vi.fn().mockResolvedValue(mockBuildResult);
    vi.mocked(buildFactory).mockReturnValue(() => mockSolutionTypeBuild);
  });

  it('should build the engine for the requested solution type', async () => {
    const mockSolutionTypeFactory = vi.fn().mockReturnValue(mockSolutionTypeBuild);
    vi.mocked(buildFactory).mockReturnValue(mockSolutionTypeFactory);

    await hydratedStaticStateFactory(controllerDefinitions, options)(SolutionType.listing)(params);

    expect(buildFactory).toHaveBeenCalledWith(controllerDefinitions, options);
    expect(mockSolutionTypeFactory).toHaveBeenCalledWith(SolutionType.listing);
  });

  it('should hand the controller props carried by the static state back as the controllers option', async () => {
    const controllerProps = {productEnrichment: {options: {placementIds: ['placement']}}};

    await hydratedStaticStateFactory(controllerDefinitions, options)(SolutionType.standalone)({
      ...params,
      controllerProps,
    });

    expect(mockSolutionTypeBuild).toHaveBeenCalledWith(
      expect.objectContaining({controllers: controllerProps})
    );
    expect(mockSolutionTypeBuild.mock.calls[0][0]).not.toHaveProperty('controllerProps');
  });

  it('should resolve only once every replayed request has completed', async () => {
    let completeRequest: (action: {type: string}) => void = () => {};
    const pendingRequest = new Promise<{type: string}>((resolve) => {
      completeRequest = resolve;
    });
    engine.waitForRequestCompletedAction.mockReturnValue([pendingRequest]);

    let settled = false;
    const hydration = hydratedStaticStateFactory(
      controllerDefinitions,
      options
    )(SolutionType.listing)(params).then(() => {
      settled = true;
    });
    await flushMicrotasks();

    expect(settled).toBe(false);

    completeRequest({type: 'commerce/productListing/fetch/fulfilled'});
    await hydration;

    expect(settled).toBe(true);
  });

  it('should refuse a static state fetched by another engine definition', async () => {
    const hydrateWithSearchDefinition = hydratedStaticStateFactory(
      controllerDefinitions,
      options
    )(SolutionType.search);

    await expect(
      hydrateWithSearchDefinition({...params, solutionType: SolutionType.listing})
    ).rejects.toThrow(
      'This static state was fetched with the listing engine definition but is being hydrated with the search engine definition'
    );
    expect(mockSolutionTypeBuild).not.toHaveBeenCalled();
  });

  it('should accept a static state built by hand without a solution type', async () => {
    await expect(
      hydratedStaticStateFactory(controllerDefinitions, options)(SolutionType.listing)(params)
    ).resolves.toEqual(mockBuildResult);
  });

  it('should return the engine and the controllers', async () => {
    const hydratedState = await hydratedStaticStateFactory(
      controllerDefinitions,
      options
    )(SolutionType.listing)(params);

    expect(hydratedState).toEqual(mockBuildResult);
  });
});

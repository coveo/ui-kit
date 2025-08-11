import type {CommerceEngineConfiguration} from '../../../app/commerce-engine/commerce-engine-configuration.js';
import type {Controller} from '../../../controllers/controller/headless-controller.js';
import {
  defineMockCommerceController,
  defineMockCommerceControllerWithProps,
} from '../../../test/mock-controller-definitions.js';
import type {CommerceEngineDefinitionOptions} from '../factories/build-factory.js';
import type {ControllerDefinition} from '../types/controller-definitions.js';
import {defineCommerceEngine} from './commerce-engine.ssr.js';

describe('Commerce Engine SSR', () => {
  let controller1: ControllerDefinition<Controller>;
  let controller2: ControllerDefinition<Controller>;

  let definitionOptions: CommerceEngineDefinitionOptions<{
    controller1: typeof controller1;
    controller2: typeof controller2;
  }>;

  beforeEach(() => {
    const mockConfiguration = {
      organizationId: 'some-org-id',
      accessToken: 'some-token',
      // TODO: KIT-4727: stop asking for context in the engine definition
      analytics: {
        trackingId: 'xxx',
      },
      context: {
        country: 'US',
        currency: 'USD',
        language: 'en',
        view: {url: 'https://example.com'},
      },
    } as CommerceEngineConfiguration;

    definitionOptions = {
      configuration: mockConfiguration,
      controllers: {
        controller1: defineMockCommerceController(),
        controller2: defineMockCommerceControllerWithProps(),
      },
    };
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should return 4 engine definitions', () => {
    const engineDefinition = defineCommerceEngine(definitionOptions);
    expect(engineDefinition).toHaveProperty('listingEngineDefinition');
    expect(engineDefinition).toHaveProperty('recommendationEngineDefinition');
    expect(engineDefinition).toHaveProperty('searchEngineDefinition');
    expect(engineDefinition).toHaveProperty('standaloneEngineDefinition');
  });

  describe.each([
    ['listingEngineDefinition'],
    ['searchEngineDefinition'],
    ['recommendationEngineDefinition'],
    ['standaloneEngineDefinition'],
  ])('%s', (definitionName) => {
    it('#getAccessToken should return the access token', () => {
      const engineDefinition = defineCommerceEngine(definitionOptions);
      const solutionType = definitionName as keyof typeof engineDefinition;
      const {getAccessToken} = engineDefinition[solutionType];
      expect(getAccessToken()).toBe('some-token');
    });

    it('#setAccessToken should update the access token', () => {
      const engineDefinition = defineCommerceEngine(definitionOptions);
      const solutionType = definitionName as keyof typeof engineDefinition;
      const {getAccessToken, setAccessToken} = engineDefinition[solutionType];
      setAccessToken('new-access-token');
      expect(getAccessToken()).toBe('new-access-token');
    });

    it('should always return context and cart controllers as well as the ones provided', async () => {
      const engineDefinition = defineCommerceEngine(definitionOptions);
      const solutionType = definitionName as keyof typeof engineDefinition;
      const staticState = await engineDefinition[solutionType].fetchStaticState(
        // @ts-expect-error: TODO: should not require to ignore error here
        {
          url: 'http://example.com',
          query: 'test',
          country: 'US',
          currency: 'USD',
          language: 'en',
        }
      );
      expect(staticState.controllers).toHaveProperty('context');
      expect(staticState.controllers).toHaveProperty('cart');
      expect(staticState.controllers).toHaveProperty('controller1');
      expect(staticState.controllers).toHaveProperty('controller2');
    });
  });

  describe('#searchEngineDefinition', () => {
    it('should always return parameter manager controller', async () => {
      const {searchEngineDefinition} = defineCommerceEngine(definitionOptions);
      const staticState = await searchEngineDefinition.fetchStaticState(
        // @ts-expect-error: TODO: should not require to ignore error here
        {
          url: 'http://example.com/search',
          query: 'foo',
          country: 'US',
          currency: 'USD',
          language: 'en',
        }
      );
      expect(staticState.controllers).toHaveProperty('parameterManager');
    });
  });

  describe('#listingEngineDefinition', () => {
    it('should always return parameter manager controller', async () => {
      const {listingEngineDefinition} = defineCommerceEngine(definitionOptions);
      const staticState = await listingEngineDefinition.fetchStaticState(
        // @ts-expect-error: TODO: should not require to ignore error here
        {
          url: 'http://example.com',
          country: 'US',
          currency: 'USD',
          language: 'en',
        }
      );
      expect(staticState.controllers).toHaveProperty('parameterManager');
    });
  });

  describe('#recommendationEngineDefinition', () => {
    // TODO: KIT-4619: validate recommendation array
    it.todo('should throw if the recommendations are missing');
  });
});

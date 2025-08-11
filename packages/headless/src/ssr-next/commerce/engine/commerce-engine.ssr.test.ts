import type {CommerceEngineConfiguration} from '../../../app/commerce-engine/commerce-engine-configuration.js';
import {defineMockCommerceController} from '../../../test/mock-controller-definitions.js';
import type {CommerceEngineDefinitionOptions} from '../factories/build-factory.js';
import {defineCommerceEngine} from './commerce-engine.ssr.js';

describe('Commerce Engine SSR', () => {
  let definitionOptions: CommerceEngineDefinitionOptions<{
    controller1: ReturnType<typeof defineMockCommerceController>;
    controller2: ReturnType<typeof defineMockCommerceController>;
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
        controller2: defineMockCommerceController(),
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

    // TODO: KIT-4742
    it.todo(
      'should always return context and cart controllers as well as the ones provided'
    );
  });

  describe('#searchEngineDefinition', () => {
    // TODO: KIT-4742
    it.todo('should always return parameter manager controller');
  });

  describe('#listingEngineDefinition', () => {
    // TODO: KIT-4742
    it.todo('should always return parameter manager controller');
  });

  describe('#recommendationEngineDefinition', () => {
    // TODO: KIT-4619: validate recommendation array
    it.todo('should throw if the recommendations are missing');
  });
});

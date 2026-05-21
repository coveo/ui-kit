import {
  createConversationEndpointClient,
  type ConversationEndpointClient,
  type ConversationEndpointClientConfiguration,
  type CoveoConversationEndpointRequest,
} from '@/src/api/index.js';
import {EndpointFacade} from '@/src/core/internal/api/base-facade/endpoint-facade.js';
import {buildRequest} from '@/src/core/internal/api/base-facade/endpoint-facade-request-builder.js';
import {getEndpointContributorRegistry} from '@/src/core/internal/api/base-facade/endpoint-contributor-registry.js';
import {FullEngine} from '@/src/core/interface/engine/engine.js';
import * as configurationSelectors from '@/src/core/interface/configuration/configuration-selectors.js';
import * as conversationEndpointMutators from './conversation-endpoint-mutators.js';
import type {ConversationEndpointCallResult} from './conversation-endpoint-types.js';
import {
  conversationEndpointKey,
  type ConversationEndpointState,
} from './conversation-endpoint-types.js';
import {loadConversationEndpoint} from './conversation-endpoint-loader.js';
import {loadConversation} from '@/src/core/interface/conversation/conversation-loader.js';
import {loadCart} from '@/src/core/interface/cart/cart-loader.js';

export class ConversationEndpointFacade extends EndpointFacade<CoveoConversationEndpointRequest> {
  readonly #client: ConversationEndpointClient;

  private constructor(engine: FullEngine, client: ConversationEndpointClient) {
    super(engine);
    this.#client = client;
    loadConversationEndpoint(engine);
    loadConversation(engine);
    loadCart(engine);
  }

  private static engineToFacadeMap = new WeakMap<
    FullEngine,
    ConversationEndpointFacade
  >();

  static getInstance(engine: FullEngine): ConversationEndpointFacade {
    let instance = ConversationEndpointFacade.engineToFacadeMap.get(engine);
    if (!instance) {
      instance = new ConversationEndpointFacade(
        engine,
        createConversationEndpointClient()
      );
      ConversationEndpointFacade.engineToFacadeMap.set(engine, instance);
    }
    return instance;
  }

  async callEndpoint(input: string): Promise<ConversationEndpointCallResult> {
    const engine = this.engine;
    const contributorRegistry = getEndpointContributorRegistry(engine);

    const endpointConfiguration: ConversationEndpointState['configuration'] = {
      trackingId: engine.read(configurationSelectors.trackingId),
      language: engine.read(configurationSelectors.language),
      country: engine.read(configurationSelectors.country),
      currency: engine.read(configurationSelectors.currency),
    };

    engine.mutate(
      conversationEndpointMutators.setConfiguration(endpointConfiguration)
    );
    engine.mutate(conversationEndpointMutators.setStatus('pending'));
    engine.mutate(conversationEndpointMutators.setError(null));

    try {
      const finalRequest = buildRequest<CoveoConversationEndpointRequest>([
        () => ({
          message: input,
        }),
        ...contributorRegistry.getOrderedContributors<CoveoConversationEndpointRequest>(
          conversationEndpointKey
        ),
        ...this.getOrderedRequestContributors(),
      ]);

      const clientConfiguration: ConversationEndpointClientConfiguration = {
        organizationId: engine.read(configurationSelectors.organizationId),
        accessToken: engine.read(configurationSelectors.accessToken),
        endpoint: engine.read(configurationSelectors.endpoint),
      };

      const result = await this.#client.call(finalRequest, clientConfiguration);

      if (!result.success) {
        engine.mutate(conversationEndpointMutators.setError(result.error));
      }

      return result;
    } finally {
      engine.mutate(conversationEndpointMutators.setStatus('idle'));
      engine.mutate(conversationEndpointMutators.setStreamingConnected(false));
    }
  }

  getRequestCompositionDebugInfo() {
    const pullContributorCount = getEndpointContributorRegistry(
      this.engine
    ).getRegisteredContributorCount(conversationEndpointKey);

    return {
      registeredContributorCount:
        this.getRegisteredRequestContributorCount() + pullContributorCount,
    };
  }
}

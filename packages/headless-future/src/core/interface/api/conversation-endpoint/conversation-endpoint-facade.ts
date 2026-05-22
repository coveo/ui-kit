import {
  createConversationEndpointClient,
  type ConversationEndpointCallOptions,
  type ConversationEndpointClient,
  type CoveoConversationEndpointRequest,
} from '@/src/api/index.js';
import {EndpointFacade} from '@/src/core/internal/api/base-facade/endpoint-facade.js';
import {buildRequest} from '@/src/core/internal/api/base-facade/endpoint-facade-request-builder.js';
import {getEndpointContributorRegistry} from '@/src/core/internal/api/base-facade/endpoint-contributor-registry.js';
import {conversationEndpointKey} from '@/src/core/internal/api/base-facade/endpoint-keys.js';
import {readEndpointClientConfiguration} from '@/src/core/internal/configuration/configuration-reader.js';
import {FullEngine} from '@/src/core/interface/engine/engine.js';
import * as conversationEndpointMutators from './conversation-endpoint-mutators.js';
import type {ConversationEndpointCallResult} from './conversation-endpoint-types.js';
import {loadConversationEndpoint} from './conversation-endpoint-loader.js';

export class ConversationEndpointFacade extends EndpointFacade<CoveoConversationEndpointRequest> {
  readonly #client: ConversationEndpointClient;

  private constructor(engine: FullEngine, client: ConversationEndpointClient) {
    super(engine);
    this.#client = client;
    loadConversationEndpoint(engine);
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

  async callEndpoint(
    input: string,
    options?: ConversationEndpointCallOptions
  ): Promise<ConversationEndpointCallResult> {
    const engine = this.engine;
    const contributorRegistry = getEndpointContributorRegistry(engine);

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

      const clientConfiguration = readEndpointClientConfiguration(engine);

      const result = options
        ? await this.#client.call(finalRequest, clientConfiguration, options)
        : await this.#client.call(finalRequest, clientConfiguration);

      if (!result.success) {
        engine.mutate(conversationEndpointMutators.setError(result.error));
        engine.mutate(conversationEndpointMutators.setStatus('idle'));
        engine.mutate(
          conversationEndpointMutators.setStreamingConnected(false)
        );
        return result;
      }

      return result;
    } catch (error) {
      const transformedError = transformUnexpectedError(error);
      engine.mutate(conversationEndpointMutators.setError(transformedError));
      engine.mutate(conversationEndpointMutators.setStatus('idle'));
      engine.mutate(conversationEndpointMutators.setStreamingConnected(false));
      return {
        success: false,
        error: transformedError,
      };
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

function transformUnexpectedError(error: unknown): string {
  if (error instanceof Error && error.message.trim()) {
    return error.message;
  }

  return 'An unexpected error occurred. Please try again.';
}

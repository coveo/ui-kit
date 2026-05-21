import type {
  CoveoSearchEndpointRequest,
  CoveoSearchEndpointResponse,
  CoveoSearchEndpointResponseHandler,
} from './search-endpoint-types.js';
import {
  createSearchEndpointClient,
  type SearchEndpointClient,
} from '@/src/api/index.js';
import {buildEndpointClientConfiguration} from '@/src/core/internal/api/base-facade/endpoint-client-configuration.js';
import {EndpointFacade} from '@/src/core/internal/api/base-facade/endpoint-facade.js';
import {buildRequest} from '@/src/core/internal/api/base-facade/endpoint-facade-request-builder.js';
import {FullEngine} from '@/src/core/interface/engine/engine.js';
import * as searchEndpointMutators from './search-endpoint-mutators.js';
import * as searchEndpointSelectors from './search-endpoint-selectors.js';
import {loadSearchEndpoint} from './search-endpoint-loader.js';

export class SearchEndpointFacade extends EndpointFacade<CoveoSearchEndpointRequest> {
  readonly #client: SearchEndpointClient;
  readonly #eventTarget: EventTarget;
  #lastResponse: CoveoSearchEndpointResponse | null = null;

  private constructor(engine: FullEngine, client: SearchEndpointClient) {
    super(engine);
    this.#client = client;
    this.#eventTarget = new EventTarget();
    loadSearchEndpoint(engine);
  }

  private static engineToFacadeMap = new WeakMap<
    FullEngine,
    SearchEndpointFacade
  >();

  static getInstance(engine: FullEngine): SearchEndpointFacade {
    let instance = SearchEndpointFacade.engineToFacadeMap.get(engine);
    if (!instance) {
      instance = new SearchEndpointFacade(engine, createSearchEndpointClient());
      SearchEndpointFacade.engineToFacadeMap.set(engine, instance);
    }
    return instance;
  }

  onResponse(handler: CoveoSearchEndpointResponseHandler): () => void {
    const listener = (evt: Event) => {
      const {response} = (evt as CustomEvent<ResponseEventDetail>).detail;
      handler(structuredClone(response));
    };

    this.#eventTarget.addEventListener('response', listener);

    return () => {
      this.#eventTarget.removeEventListener('response', listener);
    };
  }

  onStatusChange(listener: (isLoading: boolean) => void): () => void {
    return this.engine.subscribe(searchEndpointSelectors.isLoading, listener);
  }

  async callEndpoint(): Promise<void> {
    const engine = this.engine;

    engine.mutate(searchEndpointMutators.setStatus('pending'));
    engine.mutate(searchEndpointMutators.setError(null));

    try {
      const finalRequest = buildRequest(this.getOrderedRequestContributors());
      const clientConfiguration = buildEndpointClientConfiguration(engine);

      const httpResponse = await this.#client.call(
        finalRequest,
        clientConfiguration
      );

      if (!httpResponse.success) {
        engine.mutate(searchEndpointMutators.setError(httpResponse.error));
        return;
      }

      if (httpResponse.data) {
        this.#lastResponse = httpResponse.data;
        this.#eventTarget.dispatchEvent(
          new CustomEvent<ResponseEventDetail>('response', {
            detail: {response: this.#lastResponse},
          })
        );
      }
    } catch (error) {
      engine.mutate(
        searchEndpointMutators.setError(transformUnexpectedError(error))
      );
      throw error;
    } finally {
      engine.mutate(searchEndpointMutators.setStatus('idle'));
    }
  }

  getRequestCompositionDebugInfo() {
    return {
      registeredContributorCount: this.getRegisteredRequestContributorCount(),
    };
  }
}

interface ResponseEventDetail {
  response: Readonly<CoveoSearchEndpointResponse>;
}

function transformUnexpectedError(error: unknown): string {
  if (error instanceof Error && error.message.trim()) {
    return error.message;
  }

  return 'An unexpected error occurred. Please try again.';
}

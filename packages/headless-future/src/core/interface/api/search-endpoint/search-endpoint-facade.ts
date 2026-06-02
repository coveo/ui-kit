import {
  createSearchEndpointClient,
  type SearchEndpointCallOptions,
  type SearchEndpointClient,
} from '@/src/api/index.js';
import {readEndpointClientConfiguration} from '@/src/core/internal/configuration/configuration-reader.js';
import {FullEngine} from '@/src/core/interface/engine/engine.js';
import {loadSearchEndpoint} from './search-endpoint-loader.js';
import {setStatus, setError} from './search-endpoint-mutators.js';
import {buildSearchEndpointRequest} from './search-endpoint-selectors.js';
import {handleSearchEndpointResponse} from './search-endpoint-response-handler.js';

export class SearchEndpointFacade {
  readonly #engine: FullEngine;
  readonly #client: SearchEndpointClient;

  static #instances = new WeakMap<FullEngine, SearchEndpointFacade>();

  private constructor(engine: FullEngine) {
    this.#engine = engine;
    this.#client = createSearchEndpointClient();
    loadSearchEndpoint(engine);
  }

  /**
   * Retrieves the singleton instance of the SearchEndpointFacade for the given engine.
   * If no instance exists for the engine, a new one is created.
   */
  static getInstance(engine: FullEngine): SearchEndpointFacade {
    let instance = SearchEndpointFacade.#instances.get(engine);
    if (!instance) {
      instance = new SearchEndpointFacade(engine);
      SearchEndpointFacade.#instances.set(engine, instance);
    }
    return instance;
  }

  /**
   * Executes the search endpoint call sequence.
   */
  async callEndpoint(options?: SearchEndpointCallOptions): Promise<void> {
    const engine = this.#engine;

    // 1. Set loading state
    engine.mutate(setStatus('pending'));
    engine.mutate(setError(null));

    try {
      // 2. Build request from state (composed selector)
      const request = engine.read(buildSearchEndpointRequest);

      // 3. Execute HTTP call
      const config = readEndpointClientConfiguration(engine);
      const httpResponse = await this.#client.call(request, config, options);

      if (!httpResponse.success) {
        throw new Error(httpResponse.error);
      }

      // 4. Distribute response data to feature slices
      const responseData = httpResponse.data;
      if (responseData) {
        handleSearchEndpointResponse(engine, responseData);
      }
    } catch (error) {
      engine.mutate(
        setError(
          error instanceof Error
            ? error.message
            : 'An unexpected error occurred.'
        )
      );
    } finally {
      engine.mutate(setStatus('idle'));
    }
  }

  /**
   * For testing and debugging purposes, exposes internal information about the facade instance.
   */
  getDebugInfo() {
    return {
      currentRequest: this.#engine.read(buildSearchEndpointRequest),
    };
  }
}

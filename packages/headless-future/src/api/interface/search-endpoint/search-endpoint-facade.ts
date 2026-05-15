import {
  FullEngine,
  loadSearchEndpoint,
  searchApiMutators,
} from '@/src/core/index.js';
import {
  CoveoSearchEndpointRequest,
  SearchEndpointClient,
  CoveoSearchEndpointRequestMiddleware,
  CoveoSearchEndpointResponse,
  CoveoSearchEndpointResponseListener,
} from './search-endpoint-types.js';
import {createSearchEndpointClient} from '@/src/api/internal/search-endpoint/search-endpoint-client.js';
import {transformError} from '@/src/api/internal/protocol/error-handling.js';

export class SearchEndpointFacade {
  readonly #engine: FullEngine;
  readonly #client: SearchEndpointClient;
  readonly #eventTarget: EventTarget;
  #lastResponse: CoveoSearchEndpointResponse | null = null;

  private constructor(engine: FullEngine, client: SearchEndpointClient) {
    this.#engine = engine;
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
      instance = new SearchEndpointFacade(
        engine,
        createSearchEndpointClient(engine)
      );
      SearchEndpointFacade.engineToFacadeMap.set(engine, instance);
    }
    return instance;
  }

  /**
   * Register a request middleware.
   *
   * Middleware are invoked in registration order during `executeSearch()`.
   * Each middleware receives the current request and must return the
   * (potentially modified) request.
   *
   * @returns A function that, when called, removes the middleware.
   */
  onRequest(middleware: CoveoSearchEndpointRequestMiddleware): () => void {
    const handler = (evt: Event) => {
      const detail = (evt as CustomEvent<RequestEventDetail>).detail;
      detail.request = middleware(detail.request);
    };

    this.#eventTarget.addEventListener('request', handler);

    return () => {
      this.#eventTarget.removeEventListener('request', handler);
    };
  }

  /**
   * Register a response listener.
   *
   * Each listener receives a **structuredClone** of the response so that
   * mutations in one listener cannot contaminate others.
   *
   * @returns A function that, when called, removes the listener.
   */
  onResponse(listener: CoveoSearchEndpointResponseListener): () => void {
    const handler = (evt: Event) => {
      const {response} = (evt as CustomEvent<ResponseEventDetail>).detail;
      listener(structuredClone(response));
    };

    this.#eventTarget.addEventListener('response', handler);

    return () => {
      this.#eventTarget.removeEventListener('response', handler);
    };
  }

  /**
   * Subscribe to loading-state changes.
   *
   * The callback is invoked every time `status` transitions between
   * `'idle'` and `'pending'`, with `true` when a request is in flight
   * and `false` when it completes (or errors).
   *
   * @returns A function that, when called, removes the subscription.
   */
  onStatusChange(listener: (isLoading: boolean) => void): () => void {
    return this.#engine.subscribe(
      (state: any) => state.searchApi?.status,
      (status: string) => listener(status === 'pending')
    );
  }

  /**
   * Execute a search request.
   *
   * 1. Sets status to `'pending'`
   * 2. Runs request middleware pipeline
   * 3. Calls the API client
   * 4. On success, notifies all response listeners (each gets a clone)
   * 5. Sets status back to `'idle'`
   *
   */
  async callEndpoint(): Promise<void> {
    const engine = this.#engine;

    engine.mutate(searchApiMutators.setStatus('pending'));
    engine.mutate(searchApiMutators.setError(null));

    try {
      const detail: RequestEventDetail = {request: {}};
      this.#eventTarget.dispatchEvent(new CustomEvent('request', {detail}));
      const finalRequest = detail.request;

      const httpResponse = await this.#client.call(finalRequest);

      if (!httpResponse.success) {
        engine.mutate(searchApiMutators.setError(httpResponse.error));
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
      engine.mutate(searchApiMutators.setError(transformError(error)));
      throw error;
    } finally {
      engine.mutate(searchApiMutators.setStatus('idle'));
    }
  }
}

interface RequestEventDetail {
  request: CoveoSearchEndpointRequest;
}

interface ResponseEventDetail {
  response: Readonly<CoveoSearchEndpointResponse>;
}

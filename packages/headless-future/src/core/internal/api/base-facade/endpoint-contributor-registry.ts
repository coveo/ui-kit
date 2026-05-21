import type {FullEngine} from '@/src/core/interface/engine/engine.js';
import type {RequestContributor} from './endpoint-facade-types.js';

type EndpointKey = string;

export class EndpointContributorRegistry {
  readonly #contributorsByEndpoint = new Map<
    EndpointKey,
    Array<RequestContributor<object>>
  >();

  register<TRequest extends object>(
    endpoint: EndpointKey,
    contributor: RequestContributor<TRequest>
  ): () => void {
    const contributors = this.#contributorsByEndpoint.get(endpoint) ?? [];
    contributors.push(contributor as RequestContributor<object>);
    this.#contributorsByEndpoint.set(endpoint, contributors);

    return () => {
      const registeredContributors =
        this.#contributorsByEndpoint.get(endpoint) ?? [];
      const registrationIndex = registeredContributors.indexOf(
        contributor as RequestContributor<object>
      );

      if (registrationIndex === -1) {
        return;
      }

      registeredContributors.splice(registrationIndex, 1);

      if (registeredContributors.length === 0) {
        this.#contributorsByEndpoint.delete(endpoint);
      }
    };
  }

  getOrderedContributors<TRequest extends object>(
    endpoint: EndpointKey
  ): ReadonlyArray<RequestContributor<TRequest>> {
    const contributors = this.#contributorsByEndpoint.get(endpoint) ?? [];
    return [...contributors] as ReadonlyArray<RequestContributor<TRequest>>;
  }

  getRegisteredContributorCount(endpoint: EndpointKey): number {
    return this.#contributorsByEndpoint.get(endpoint)?.length ?? 0;
  }
}

const registryByEngine = new WeakMap<FullEngine, EndpointContributorRegistry>();

export const getEndpointContributorRegistry = (engine: FullEngine) => {
  const existingRegistry = registryByEngine.get(engine);

  if (existingRegistry) {
    return existingRegistry;
  }

  const newRegistry = new EndpointContributorRegistry();
  registryByEngine.set(engine, newRegistry);
  return newRegistry;
};

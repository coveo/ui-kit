import type {FullEngine} from '@/src/core/index.js';
import type {RequestContributor} from './endpoint-facade-types.js';

export class EndpointFacade<TRequest extends object> {
  readonly #requestContributors: Array<RequestContributor<TRequest>> = [];

  protected readonly engine: FullEngine;

  protected constructor(engine: FullEngine) {
    this.engine = engine;
  }

  onRequest(contribute: RequestContributor<TRequest>): () => void {
    this.#requestContributors.push(contribute);

    return () => {
      const registrationIndex = this.#requestContributors.indexOf(contribute);
      if (registrationIndex !== -1) {
        this.#requestContributors.splice(registrationIndex, 1);
      }
    };
  }

  protected getOrderedRequestContributors(): Array<
    RequestContributor<TRequest>
  > {
    return [...this.#requestContributors];
  }

  protected getRegisteredRequestContributorCount(): number {
    return this.#requestContributors.length;
  }
}

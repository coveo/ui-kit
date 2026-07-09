import {BaseInterface} from '@/src/internal/utils/index.js';
import {
  Engine,
  getFullEngine,
  type FullEngine,
} from '@/src/internal/engine/index.js';
import type {
  FacadeResolverFactory,
  Facades,
} from '@/src/internal/utils/index.js';
import {generateId} from '@/src/internal/utils/index.js';
import {createCommerceSearchFacadeResolver} from '@/src/internal/api/commerce-search/index.js';
import {createCommerceSuggestionsFacadeResolver} from '@/src/internal/api/commerce-query-suggest/index.js';

const resolverFactories: Record<Facades['commerce'], FacadeResolverFactory> = {
  search: createCommerceSearchFacadeResolver,
  suggestions: createCommerceSuggestionsFacadeResolver,
};

export class CommerceInterface extends BaseInterface<'commerce'> {
  constructor(engine: FullEngine, stateId: string) {
    super(engine, stateId, 'commerce', resolverFactories);
  }
}

export interface BuildCommerceInterfaceOptions {
  engine: Engine;
  id?: string;
}

export function buildCommerceInterface(
  options: BuildCommerceInterfaceOptions
): CommerceInterface {
  const fullEngine = getFullEngine(options.engine);
  const interfaceId = options.id ?? generateId();

  return new CommerceInterface(fullEngine, interfaceId);
}

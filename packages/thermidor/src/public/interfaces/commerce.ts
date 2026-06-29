import {BaseInterface} from '@/src/core/interface/base-interface.js';
import {
  Engine,
  getFullEngine,
  type FullEngine,
} from '@/src/core/interface/engine/engine.js';
import type {
  FacadeResolverFactory,
  Facades,
} from '@/src/core/interface/utils/interface-types.js';
import {generateId} from '@/src/core/interface/utils/id-generator.js';
import {createCommerceSearchFacadeResolver} from '@/src/core/interface/api/commerce-search/commerce-search-facade.js';
import {createCommerceSuggestionsFacadeResolver} from '@/src/core/interface/api/commerce-query-suggest/commerce-query-suggest-facade.js';

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

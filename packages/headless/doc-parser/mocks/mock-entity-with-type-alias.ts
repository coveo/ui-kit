import {EntityWithTypeAlias} from '../src/entity.js';

export function buildMockEntityWithTypeAlias(
  config: Partial<EntityWithTypeAlias> = {}
): EntityWithTypeAlias {
  return {
    kind: 'primitive-with-type-alias',
    desc: '',
    isOptional: false,
    name: '',
    type: '',
    ...config,
  };
}

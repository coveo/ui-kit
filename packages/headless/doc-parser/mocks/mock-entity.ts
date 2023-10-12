import {Entity} from '../src/entity.js';

export function buildMockEntity(config: Partial<Entity> = {}): Entity {
  return {
    kind: 'primitive',
    desc: '',
    isOptional: false,
    name: '',
    type: '',
    ...config,
  };
}

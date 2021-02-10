import {Entity} from '../src/entity';

export function buildMockEntity(config: Partial<Entity> = {}): Entity {
  return {
    desc: '',
    isOptional: false,
    name: '',
    type: '',
    ...config,
  };
}

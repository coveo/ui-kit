import {FuncEntity} from '../src/entity.js';
import {buildMockEntity} from './mock-entity.js';

export function buildMockFuncEntity(
  config: Partial<FuncEntity> = {}
): FuncEntity {
  return {
    kind: 'function',
    desc: '',
    name: '',
    params: [],
    returnType: buildMockEntity(),
    ...config,
  };
}

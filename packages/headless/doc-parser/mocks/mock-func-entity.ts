import {FuncEntity} from '../src/entity';
import {buildMockEntity} from './mock-entity';

export function buildMockFuncEntity(
  config: Partial<FuncEntity> = {}
): FuncEntity {
  return {
    kind: 'function',
    desc: '',
    name: '',
    params: [],
    returnType: buildMockEntity({
      name: 'returnType',
      type: 'void',
      isOptional: false,
      desc: '',
    }),
    ...config,
  };
}

import {FuncEntity} from '../src/entity';

export function buildMockFuncEntity(
  config: Partial<FuncEntity> = {}
): FuncEntity {
  return {
    kind: 'function',
    desc: '',
    name: '',
    params: [],
    returnType: '',
    ...config,
  };
}

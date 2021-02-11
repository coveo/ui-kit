import {FuncEntity} from '../src/entity';

export function buildMockFuncEntity(
  config: Partial<FuncEntity> = {}
): FuncEntity {
  return {
    desc: '',
    name: '',
    params: [],
    returnType: '',
    ...config,
  };
}

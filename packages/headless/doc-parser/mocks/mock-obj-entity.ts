import {ObjEntity} from '../src/entity';

export function buildMockObjEntity(config: Partial<ObjEntity> = {}): ObjEntity {
  return {
    name: '',
    type: '',
    desc: '',
    isOptional: false,
    members: [],
    ...config,
  };
}

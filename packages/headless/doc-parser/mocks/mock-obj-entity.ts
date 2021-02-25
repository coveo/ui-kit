import {ObjEntity} from '../src/entity';

export function buildMockObjEntity(config: Partial<ObjEntity> = {}): ObjEntity {
  return {
    kind: 'object',
    name: '',
    type: '',
    desc: '',
    isOptional: false,
    members: [],
    isTypeExtracted: false,
    typeName: '',
    ...config,
  };
}

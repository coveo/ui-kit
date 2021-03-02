import {buildMockFuncEntity} from '../mocks/mock-func-entity';
import {buildMockObjEntity} from '../mocks/mock-obj-entity';
import {isFunctionEntity, isObjectEntity} from './entity';

describe('#isObjectEntity', () => {
  it('given an object entity, it returns true', () => {
    const entity = buildMockObjEntity();
    expect(isObjectEntity(entity)).toBe(true);
  });
});

describe('#isFuncEntity', () => {
  it('given a function entity, it returns true', () => {
    const entity = buildMockFuncEntity();
    expect(isFunctionEntity(entity)).toBe(true);
  });
});

import {buildMockFuncEntity} from '../mocks/mock-func-entity.js';
import {buildMockObjEntity} from '../mocks/mock-obj-entity.js';
import {isFunctionEntity, isObjectEntity} from './entity.js';

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

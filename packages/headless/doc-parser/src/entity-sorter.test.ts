import {buildMockEntity} from '../mocks/mock-entity';
import {buildMockFuncEntity} from '../mocks/mock-func-entity';
import {sortEntities} from './entity-sorter';

describe('#sortEntities', () => {
  it('sorts entities correctly', () => {
    const aabOptionalAttribute = buildMockEntity({
      name: 'aab',
      isOptional: true,
    });
    const sayHelloFunc = buildMockFuncEntity({name: 'sayHello'});
    const aacMandatoryAttribute = buildMockEntity({
      name: 'aac',
      isOptional: false,
    });
    const getNameFunc = buildMockFuncEntity({name: 'getName'});
    const aaaMandatoryAttribute = buildMockEntity({
      name: 'aaa',
      isOptional: false,
    });

    expect(
      sortEntities([
        aabOptionalAttribute,
        sayHelloFunc,
        aacMandatoryAttribute,
        getNameFunc,
        aaaMandatoryAttribute,
      ])
    ).toStrictEqual([
      aaaMandatoryAttribute,
      aacMandatoryAttribute,
      aabOptionalAttribute,
      getNameFunc,
      sayHelloFunc,
    ]);
  });
});

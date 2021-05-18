import {buildMockEntity} from '../../mocks/mock-entity';
import {buildMockFuncEntity} from '../../mocks/mock-func-entity';
import {buildMockObjEntity} from '../../mocks/mock-obj-entity';
import {extractControllerTypes} from './controller-type-extractor';

describe('#extractControllerTypes', () => {
  it('extracts object entities on a controller #options interface', () => {
    const engine = buildMockEntity({name: 'engine'});

    const query = buildMockEntity({
      name: 'query',
      type: 'string',
    });

    const facetSearch = buildMockObjEntity({
      name: 'facetSearch',
      isTypeExtracted: false,
      typeName: 'FacetSearchOptions',
      members: [query],
    });

    const options = buildMockObjEntity({
      name: 'options',
      type: 'FacetOptions',
      members: [facetSearch],
    });

    const props = buildMockObjEntity({
      name: 'props',
      type: 'FacetProps',
      members: [options],
    });

    const initializer = buildMockFuncEntity({
      name: 'buildFacet',
      params: [engine, props],
    });

    const result = extractControllerTypes(initializer, []);
    const expected = buildMockObjEntity({
      name: 'FacetSearchOptions',
      members: [query],
    });

    expect(facetSearch.isTypeExtracted).toBe(true);
    expect(result).toContainEqual(expected);
  });
});

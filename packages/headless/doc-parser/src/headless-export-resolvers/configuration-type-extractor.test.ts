import {buildMockEntity} from '../../mocks/mock-entity';
import {buildMockFuncEntity} from '../../mocks/mock-func-entity';
import {buildMockObjEntity} from '../../mocks/mock-obj-entity';
import {extractTypesFromConfiguration} from './configuration-type-extractor';

describe('#extractTypesFromConfiguration', () => {
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

    const result = extractTypesFromConfiguration(initializer, []);
    const expected = buildMockObjEntity({
      name: 'FacetSearchOptions',
      members: [query],
    });

    expect(facetSearch.isTypeExtracted).toBe(true);
    expect(result).toContainEqual(expected);
  });
});

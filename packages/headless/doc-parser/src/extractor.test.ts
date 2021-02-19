import {buildMockEntity} from '../mocks/mock-entity';
import {buildMockFuncEntity} from '../mocks/mock-func-entity';
import {buildMockObjEntity} from '../mocks/mock-obj-entity';
import {extractTypes} from './extractor';

describe('#extractTypes', () => {
  it('given Facet.state.values with type #FacetValue[], it extracts #FacetValue as an entity', () => {
    const numberOfResults = buildMockEntity({
      name: 'numberOfResults',
      type: 'number',
    });

    const values = buildMockObjEntity({
      name: 'values',
      type: 'FacetValue[]',
      typeName: 'FacetValue',
      members: [numberOfResults],
      isTypeExtracted: false,
    });

    const state = buildMockObjEntity({
      name: 'state',
      members: [values],
    });

    const {types} = extractTypes([state]);

    const expectedEntity = buildMockObjEntity({
      name: 'FacetValue',
      members: [numberOfResults],
    });

    expect(types).toEqual([expectedEntity]);
  });

  it('when a type is extracted, it sets #members to an empty array and #isTypeExtracted to true on the entity', () => {
    const numberOfResults = buildMockEntity({name: 'numberOfResults'});

    const values = buildMockObjEntity({
      name: 'values',
      members: [numberOfResults],
      isTypeExtracted: false,
    });

    const state = buildMockObjEntity({name: 'state', members: [values]});

    extractTypes([state]);

    expect(values.members.length).toBe(0);
    expect(values.isTypeExtracted).toBe(true);
  });

  it(`given Facet.state.facetSearch.values with type #SpecificFacetSearchResult,
  it extracts #FacetSearchState and #SpecificFacetSearchResult as type entities`, () => {
    const displayValue = buildMockEntity({
      name: 'displayValue',
      type: 'string',
    });

    const values = buildMockObjEntity({
      name: 'values',
      type: 'SpecificFacetSearchResult[]',
      typeName: 'SpecificFacetSearchResult',
      members: [displayValue],
    });

    const facetSearch = buildMockObjEntity({
      name: 'facetSearch',
      type: 'FacetSearchState',
      typeName: 'FacetSearchState',
      members: [values],
    });

    const state = buildMockObjEntity({
      name: 'state',
      members: [facetSearch],
    });

    const {types} = extractTypes([state]);

    const expectedEntity1 = buildMockObjEntity({
      name: 'FacetSearchState',
      members: [values],
    });

    const expectedEntity2 = buildMockObjEntity({
      name: 'SpecificFacetSearchResult',
      members: [displayValue],
    });

    expect(types).toEqual([expectedEntity1, expectedEntity2]);
  });

  it(`when multiple entities have strictly members with primitive types,
  it does not extract anything`, () => {
    const numberOfResults = buildMockEntity({
      name: 'numberOfResults',
      type: 'number',
    });

    const facetSearch = buildMockObjEntity({
      name: 'facetSearch',
      type: 'FacetSearchState',
      members: [numberOfResults],
    });

    const state = buildMockObjEntity({
      name: 'state',
      type: 'FacetState',
      members: [numberOfResults],
    });

    const {types} = extractTypes([state, facetSearch]);
    expect(types).toEqual([]);
  });

  it('when funcEntity has a param with a complex type, it extracts the type', () => {
    const numberOfResults = buildMockEntity({
      name: 'numberOfResults',
      type: 'number',
    });

    const selection = buildMockObjEntity({
      name: 'selection',
      typeName: 'FacetValue',
      members: [numberOfResults],
    });

    const toggleSelect = buildMockFuncEntity({
      name: 'toggleSelect',
      params: [selection],
    });

    const {types} = extractTypes([toggleSelect]);

    const expected = buildMockObjEntity({
      name: 'FacetValue',
      members: [numberOfResults],
    });

    expect(types).toEqual([expected]);
  });
});

import {buildMockEntity} from '../mocks/mock-entity';
import {buildMockObjEntity} from '../mocks/mock-obj-entity';
import {extractTypes} from './extractor';

describe('#extractTypes', () => {
  describe('given Facet.state.values with type #FacetValue[]', () => {
    it('extracts #FacetValue as an entity', () => {
      const numberOfResults = buildMockEntity({
        name: 'numberOfResults',
        type: 'number',
      });

      const values = buildMockObjEntity({
        name: 'values',
        type: 'FacetValue[]',
        members: [numberOfResults],
      });

      const state = buildMockObjEntity({
        name: 'state',
        members: [values],
      });

      const {types} = extractTypes([state]);

      const expectedEntity = buildMockObjEntity({
        name: 'FacetValue[]',
        type: 'FacetValue[]',
        members: [numberOfResults],
      });

      expect(types).toEqual([expectedEntity]);
    });
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
      members: [displayValue],
    });

    const facetSearch = buildMockObjEntity({
      name: 'facetSearch',
      type: 'FacetSearchState',
      members: [values],
    });

    const state = buildMockObjEntity({
      name: 'state',
      members: [facetSearch],
    });

    const {types} = extractTypes([state]);

    const expectedEntity1 = buildMockObjEntity({
      name: 'FacetSearchState',
      type: 'FacetSearchState',
      members: [values],
    });

    const expectedEntity2 = buildMockObjEntity({
      name: 'SpecificFacetSearchResult[]',
      type: 'SpecificFacetSearchResult[]',
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
});

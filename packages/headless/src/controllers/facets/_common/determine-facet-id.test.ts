import {buildMockSearchAppEngine} from '../../../test';
import {buildMockFacetIdConfig} from '../../../test/mock-facet-id-config';
import {determineFacetId} from './determine-facet-id';
import * as FacetIdGenerator from './facet-id-generator';

describe('#determineFacetId', () => {
  it('when a #facetId key is passed, it returns it', () => {
    const engine = buildMockSearchAppEngine();
    const id = determineFacetId(engine, {facetId: '', field: 'author'});
    expect(id).toBe('');
  });

  it('when the #facetId key is not passed, it calls #generateFacetId', () => {
    jest.spyOn(FacetIdGenerator, 'generateFacetId');
    const engine = buildMockSearchAppEngine();
    determineFacetId(engine, {field: 'author'});

    const {state, logger} = engine;
    const config = buildMockFacetIdConfig({field: 'author', state});
    expect(FacetIdGenerator.generateFacetId).toHaveBeenCalledWith(
      config,
      logger
    );
  });
});

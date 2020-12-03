import {SearchAppState} from '../../../state/search-app-state';
import {buildMockSearchAppEngine, MockEngine} from '../../../test';
import {buildMockFacetIdConfig} from '../../../test/mock-facet-id-config';
import {determineFacetId} from './facet-id-determinor';
import * as FacetIdGenerator from './facet-id-generator';

describe('#determineFacetId', () => {
  let engine: MockEngine<SearchAppState>;

  beforeEach(() => {
    engine = buildMockSearchAppEngine();
  });

  it('when a #facetId key is passed, it returns it', () => {
    const id = determineFacetId(engine, {facetId: '', field: 'author'});
    expect(id).toBe('');
  });

  it('when the #facetId key is not passed, it calls #generateFacetId', () => {
    jest.spyOn(FacetIdGenerator, 'generateFacetId');
    determineFacetId(engine, {field: 'author'});

    const {state, logger} = engine;
    const config = buildMockFacetIdConfig({field: 'author', state});
    expect(FacetIdGenerator.generateFacetId).toHaveBeenCalledWith(
      config,
      logger
    );
  });
});

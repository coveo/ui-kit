import {
  buildMockSearchEngine,
  type MockedSearchEngine,
} from '../../../../test/mock-engine-v2.js';
import {buildMockFacetIdConfig} from '../../../../test/mock-facet-id-config.js';
import {createMockState} from '../../../../test/mock-state.js';
import {determineFacetId} from './facet-id-determinor.js';
import * as FacetIdGenerator from './facet-id-generator.js';

describe('#determineFacetId', () => {
  let engine: MockedSearchEngine;

  beforeEach(() => {
    engine = buildMockSearchEngine(createMockState());
  });

  it('when a #facetId key is passed, it returns it', () => {
    const id = determineFacetId(engine, {facetId: 'a', field: 'author'});
    expect(id).toBe('a');
  });

  it('when a #facetId key is empty, it calls #generateFacetId', () => {
    vi.spyOn(FacetIdGenerator, 'generateFacetId');
    determineFacetId(engine, {facetId: '', field: 'author'});

    const {state, logger} = engine;
    const config = buildMockFacetIdConfig({field: 'author', state});
    expect(FacetIdGenerator.generateFacetId).toHaveBeenCalledWith(
      config,
      logger
    );
  });

  it('when the #facetId key is not passed, it calls #generateFacetId', () => {
    vi.spyOn(FacetIdGenerator, 'generateFacetId');
    determineFacetId(engine, {field: 'author'});

    const {state, logger} = engine;
    const config = buildMockFacetIdConfig({field: 'author', state});
    expect(FacetIdGenerator.generateFacetId).toHaveBeenCalledWith(
      config,
      logger
    );
  });
});

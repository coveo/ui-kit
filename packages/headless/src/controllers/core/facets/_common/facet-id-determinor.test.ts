import {
  buildMockSearchEngine,
  MockedSearchEngine,
} from '../../../../test/mock-engine-v2';
import {buildMockFacetIdConfig} from '../../../../test/mock-facet-id-config';
import {createMockState} from '../../../../test/mock-state';
import {determineFacetId} from './facet-id-determinor';
import * as FacetIdGenerator from './facet-id-generator';

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
    jest.spyOn(FacetIdGenerator, 'generateFacetId');
    determineFacetId(engine, {facetId: '', field: 'author'});

    const {state, logger} = engine;
    const config = buildMockFacetIdConfig({field: 'author', state});
    expect(FacetIdGenerator.generateFacetId).toHaveBeenCalledWith(
      config,
      logger
    );
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

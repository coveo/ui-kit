import {SearchAppState} from '../../../state/search-app-state';
import {buildMockSearchAppEngine, MockEngine} from '../../../test';
import {buildMockFacetIdConfig} from '../../../test/mock-facet-id-config';
import {buildMockFacetRequest} from '../../../test/mock-facet-request';
import {determineFacetId} from './facet-id-determinor';
import * as FacetIdGenerator from './facet-id-generator';

describe('#determineFacetId', () => {
  let engine: MockEngine<SearchAppState>;

  beforeEach(() => {
    engine = buildMockSearchAppEngine();
  });

  it('when a #facetId is passed and not being used, it returns it', () => {
    const id = determineFacetId(engine, {facetId: 'a', field: 'author'});
    expect(id).toBe('a');
  });

  describe('when the #facetId is being used', () => {
    const duplicateId = 'a';

    beforeEach(() => {
      engine.state.facetSet[duplicateId] = buildMockFacetRequest();
    });

    it('logs a warning', () => {
      engine.logger.warn = jest.fn();

      determineFacetId(engine, {facetId: duplicateId, field: 'author'});
      expect(engine.logger.warn).toHaveBeenCalledTimes(1);
    });

    it('calls #generateFacetId', () => {
      const spy = jest.spyOn(FacetIdGenerator, 'generateFacetId');

      determineFacetId(engine, {facetId: duplicateId, field: 'author'});
      expect(spy).toHaveBeenCalled();
    });
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

import {buildMockFacetRequest} from '../../../test/mock-facet-request';
import * as FacetReducers from './facet-reducer-helpers';
import {FacetRequest} from '../facet-set/interfaces/request';
import {buildMockFacetValueRequest} from '../../../test/mock-facet-value-request';

describe('generic facet reducers', () => {
  describe('#handleFacetSortCriterionUpdate', () => {
    it('when the facet id is registered, it updates the sort criterion to the passed value', () => {
      const id = '1';
      const criterion = 'alphanumeric';
      const state = {[id]: buildMockFacetRequest()};

      FacetReducers.handleFacetSortCriterionUpdate<FacetRequest>(state, {
        facetId: id,
        criterion,
      });

      expect(state[id].sortCriteria).toBe(criterion);
    });

    it('when the facet id is not registered, it does not throw', () => {
      const id = '1';
      const criterion = 'alphanumeric';

      const method = () =>
        FacetReducers.handleFacetSortCriterionUpdate<FacetRequest>(
          {},
          {facetId: id, criterion}
        );
      expect(method).not.toThrow();
    });
  });

  describe('#handleFacetDeselectAll', () => {
    describe('when the passed id is registered', () => {
      it('sets #currentValues to an empty array', () => {
        const id = '1';
        const value = buildMockFacetValueRequest();
        const state = {[id]: buildMockFacetRequest({currentValues: [value]})};

        FacetReducers.handleFacetDeselectAll<FacetRequest>(state, id);
        expect(state[id].currentValues).toEqual([]);
      });

      it('sets #preventAutoSelect to true on the request', () => {
        const id = '1';
        const state = {[id]: buildMockFacetRequest({preventAutoSelect: false})};

        FacetReducers.handleFacetDeselectAll(state, id);
        expect(state[id].preventAutoSelect).toBe(true);
      });
    });

    it('when the passed id is not registered, it does not throw', () => {
      expect(() => FacetReducers.handleFacetDeselectAll({}, '1')).not.toThrow();
    });
  });

  // it('#handleDeselectAllFacets calls #handleFacetDeselectAll for every facet', () => {
  //   let state :Record<string, FacetRequest> = {}
  //   jest.spyOn(FacetReducers, 'handleFacetDeselectAll');
  //   state['1'] = buildMockFacetRequest();
  //   state['2'] = buildMockFacetRequest();
  //   state['3'] = buildMockFacetRequest();
  //   FacetReducers.handleDeselectAllFacets(state);
  //   expect(
  //     FacetReducers.handleFacetDeselectAll
  //   ).toHaveBeenCalledTimes(3);
  // });

  describe('#handleFacetUpdateNumberOfValues', () => {
    it('when the id is registered, it updates the number of values', () => {
      const facetId = '1';
      const state = {[facetId]: buildMockFacetRequest()};
      const numberOfValues = 20;

      FacetReducers.handleFacetUpdateNumberOfValues(state, {
        facetId,
        numberOfValues,
      });
      expect(state[facetId].numberOfValues).toBe(numberOfValues);
    });

    it('when the id is not registered, it does not throw', () => {
      const method = () =>
        FacetReducers.handleFacetUpdateNumberOfValues(
          {},
          {facetId: '1', numberOfValues: 20}
        );

      expect(method).not.toThrow();
    });
  });
});

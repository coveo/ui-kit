import {buildMockFacetRequest} from '../../../test/mock-facet-request';
import {handleFacetSortCriterionUpdate} from './facet-reducer-helpers';
import {FacetRequest} from '../facet-set/interfaces/request';

describe('generic facet reducers', () => {
  describe('#handleFacetSortCriterionUpdate', () => {
    it('when the facet id is registered, it updates the sort criterion to the passed value', () => {
      const id = '1';
      const criterion = 'alphanumeric';
      const state = {[id]: buildMockFacetRequest()};

      handleFacetSortCriterionUpdate<FacetRequest>(state, {
        facetId: id,
        criterion,
      });

      expect(state[id].sortCriteria).toBe(criterion);
    });

    it('when the facet id is not registered, it does not throw', () => {
      const id = '1';
      const criterion = 'alphanumeric';

      const method = () =>
        handleFacetSortCriterionUpdate<FacetRequest>(
          {},
          {facetId: id, criterion}
        );
      expect(method).not.toThrow();
    });
  });
});

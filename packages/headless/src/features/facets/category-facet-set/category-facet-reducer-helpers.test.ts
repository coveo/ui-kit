import {buildMockCategoryFacetRequest} from '../../../test/mock-category-facet-request';
import {buildMockCategoryFacetValueRequest} from '../../../test/mock-category-facet-value-request';
import {selectPath} from './category-facet-reducer-helpers';

describe('category facet reducer helpers', () => {
  describe('#selectPath', () => {
    describe('when the path is populated array', () => {
      it('sets #currentValues to the expected nested value', () => {
        const request = buildMockCategoryFacetRequest();
        const path = ['a', 'b'];

        selectPath(request, path);

        const b = buildMockCategoryFacetValueRequest({
          value: 'b',
          state: 'selected',
          retrieveChildren: true,
          retrieveCount: 5,
        });

        const a = buildMockCategoryFacetValueRequest({
          value: 'a',
          children: [b],
          retrieveChildren: false,
          state: 'idle',
          retrieveCount: 5,
        });

        expect(request.currentValues).toEqual([a]);
      });

      it('sets #numberOfValues to 1', () => {
        const request = buildMockCategoryFacetRequest();
        selectPath(request, ['a']);

        expect(request.numberOfValues).toBe(1);
      });
    });

    describe('when the path is an empty array', () => {
      it('sets #currentValues to an empty array', () => {
        const currentValues = [
          buildMockCategoryFacetValueRequest({value: 'a'}),
        ];
        const request = buildMockCategoryFacetRequest({currentValues});

        selectPath(request, []);

        expect(request.currentValues).toEqual([]);
      });

      it('does not adjust the #numberOfValues of the request', () => {
        const numberOfValues = 5;
        const request = buildMockCategoryFacetRequest({numberOfValues});
        selectPath(request, []);

        expect(request.numberOfValues).toBe(numberOfValues);
      });
    });

    it('sets the request #preventAutoSelect to true', () => {
      const request = buildMockCategoryFacetRequest({preventAutoSelect: false});
      selectPath(request, []);

      expect(request.preventAutoSelect).toBe(true);
    });
  });
});

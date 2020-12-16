import {buildMockCategoryFacetRequest} from '../../../test/mock-category-facet-request';
import {buildMockCategoryFacetValueRequest} from '../../../test/mock-category-facet-value-request';
import {selectPath} from './category-facet-reducer-helpers';

describe('category facet reducer helpers', () => {
  describe('#selectPath', () => {
    const retrieveCount = 10;

    describe('when the path is populated array', () => {
      it('sets #currentValues to the expected nested value', () => {
        const request = buildMockCategoryFacetRequest();
        const path = ['a', 'b'];

        selectPath(request, path, retrieveCount);

        const b = buildMockCategoryFacetValueRequest({
          value: 'b',
          state: 'selected',
          retrieveChildren: true,
          retrieveCount,
        });

        const a = buildMockCategoryFacetValueRequest({
          value: 'a',
          children: [b],
          retrieveChildren: false,
          state: 'idle',
          retrieveCount,
        });

        expect(request.currentValues).toEqual([a]);
      });

      it('does not adjust the #numberOfValues', () => {
        const numberOfValues = 5;
        const request = buildMockCategoryFacetRequest({numberOfValues});
        selectPath(request, ['a'], retrieveCount);

        expect(request.numberOfValues).toBe(numberOfValues);
      });
    });

    describe('when the path is an empty array', () => {
      it('sets #currentValues to an empty array', () => {
        const currentValues = [
          buildMockCategoryFacetValueRequest({value: 'a'}),
        ];
        const request = buildMockCategoryFacetRequest({currentValues});

        selectPath(request, [], retrieveCount);

        expect(request.currentValues).toEqual([]);
      });

      it('does not adjust the #numberOfValues', () => {
        const numberOfValues = 5;
        const request = buildMockCategoryFacetRequest({numberOfValues});
        selectPath(request, [], retrieveCount);

        expect(request.numberOfValues).toBe(numberOfValues);
      });
    });

    it('sets the request #preventAutoSelect to true', () => {
      const request = buildMockCategoryFacetRequest({preventAutoSelect: false});
      selectPath(request, [], retrieveCount);

      expect(request.preventAutoSelect).toBe(true);
    });
  });
});

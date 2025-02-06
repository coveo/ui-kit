import {testSearch, testInsight, expect} from './fixture';
import {useCaseTestCases} from '../../../../../../playwright/utils/useCase';

const fixtures = {
  search: testSearch,
  insight: testInsight,
};

useCaseTestCases.forEach((useCase) => {
  let test = fixtures[useCase.value];

  test.describe(`quantic facet manager ${useCase.label}`, () => {
    test('should expect 1 to equal 1', async ({facetManager}) => {
      console.log(facetManager);
      expect(1).toEqual(1);
    });
  });
});

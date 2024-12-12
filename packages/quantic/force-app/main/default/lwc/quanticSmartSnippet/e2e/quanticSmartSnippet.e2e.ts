import {testSearch, testInsight, expect} from './fixture';
import {useCaseTestCases} from '../../../../../../playwright/utils/useCase';

const maximumSnippetHeight = 250;

const fixtures = {
  search: testSearch,
  insight: testInsight,
};

useCaseTestCases.forEach((useCase) => {
  let test = fixtures[useCase.value];

  test.describe(`quantic smart snippet ${useCase.label}`, () => {
    // TODO: Add tests
    console.log(expect, maximumSnippetHeight);
  });
});
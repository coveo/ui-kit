import {testSearch, testInsight} from './fixture';
import {useCaseTestCases} from '../../../../../../playwright/utils/useCase';

const fixtures = {
  search: testSearch,
  insight: testInsight,
};

useCaseTestCases.forEach((useCase) => {
  let test = fixtures[useCase.value];

  test.describe(`quantic smart snippet suggestions ${useCase.label}`, () => {
    test.describe('when expanding and collapsing the smart snippet suggestions', () => {
      test('should send the expand and collapse analytics events', async () => {});
    });

    test.describe.skip('when interacting with a suggestion', () => {
      test('should send the source title analytics event when the title is clicked', async () => {});

      test('should send the source uri analytics event when the uri is clicked', async () => {});

      test('should send the inline link analytics event when an inline link is clicked', async () => {});
    });
  });
});

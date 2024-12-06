import {testSearch, testInsight} from './fixture';
import {useCaseTestCases} from '../../../../../../playwright/utils/useCase';

const fixtures = {
  search: testSearch,
  insight: testInsight,
};

useCaseTestCases.forEach((useCase) => {
  let test = fixtures[useCase.value];

  test.describe(`quantic tab bar ${useCase.label}`, () => {
    test.describe("when the container's width can fit all the tabs", () => {
      test('should display all the tabs without displaying the dropdown list', async ({
        tabBar,
      }) => {
        // TODO: Implement the test
        console.log(tabBar);
      });
    });

    test.describe('when the viewport is resized to a medium width', () => {
      test('should display only the first two tabs, the other tabs should be displayed in the dropdown list', async ({
        tabBar,
      }) => {
        // TODO: Implement the test
        console.log(tabBar);
      });
    });

    test.describe('when the viewport is resized to a small width', () => {
      test('should display only the selected tab, the other tabs should be displayed in the dropdown list', async ({
        tabBar,
      }) => {
        // TODO: Implement the test
        console.log(tabBar);
      });
    });

    test.describe('when the viewport is resized to an extra small width', () => {
      test('should display only the selected tab, the other tabs should be displayed in the dropdown list', async ({
        tabBar,
      }) => {
        // TODO: Implement the test
        console.log(tabBar);
      });
    });

    test.describe('when the dropdown loses focus', () => {
      test('should automatically close the dropdown list', async ({tabBar}) => {
        // TODO: Implement the test
        console.log(tabBar);
      });
    });

    test.describe('when a tab containing the same expression as another tab is selected from the dropdown list', () => {
      test('should correctly select the tab', async ({tabBar}) => {
        // TODO: Implement the test
        console.log(tabBar);
      });
    });
  });
});

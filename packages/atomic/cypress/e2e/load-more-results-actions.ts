import {addTag, TagProps, TestFixture} from '../fixtures/test-fixture';
import {
  loadMoreResultsComponent,
  LoadMoreResultsSelectors,
} from './load-more-results-selectors';

export const addLoadMoreResults =
  (props: TagProps = {}) =>
  (env: TestFixture) => {
    addTag(env, loadMoreResultsComponent, props);
  };

export function pressLoadMoreResults() {
  LoadMoreResultsSelectors.resultsRecap().then((recap) => {
    const totalMatch = recap.text().match(/\bshowing ([0-9]+) of/i);
    const total = totalMatch ? parseInt(totalMatch[1]) : 0;
    const newTotal = total + 10;
    LoadMoreResultsSelectors.button().click();
    LoadMoreResultsSelectors.resultsRecap().should(
      'include.text',
      `Showing ${newTotal} of`
    );
  });
}

import {addTag, TagProps, TestFixture} from '../fixtures/test-fixture';
import {loadMoreResultsComponent} from './load-more-results-selectors';

export const addLoadMoreResults =
  (props: TagProps = {}) =>
  (env: TestFixture) => {
    addTag(env, loadMoreResultsComponent, props);
  };

import {addTag, TagProps, TestFixture} from '../fixtures/test-fixture';

export const addQuerySummary =
  (props: TagProps = {}) =>
  (env: TestFixture) => {
    addTag(env, 'atomic-query-summary', props);
  };
